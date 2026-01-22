import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CreatePropertyRequest, Property } from '../types/property';
import { propertiesService } from '../services/properties.service';
import { locationService } from '../services/location.service';
import type { LocationSuggestion } from '../services/location.service';

export interface ListingImage {
  id?: string;
  file?: File;
  previewUrl: string;
  uploadedUrl?: string;
  isPrimary: boolean;
}

export interface ListingFormState {
  listingType: CreatePropertyRequest['listingType'];
  propertyType: CreatePropertyRequest['propertyType'];
  title: string;
  description: string;
  price: number | '';
  area: number | '';
  areaUnit: string;
  bedrooms: number | '';
  bathrooms: number | '';
  address: string;
  city: string;
  state: string;
  pincode: string;
  locality: string;
  landmark: string;
  latitude: number | '';
  longitude: number | '';
}

export const defaultState: ListingFormState = {
  listingType: 'sale',
  propertyType: 'apartment',
  title: '',
  description: '',
  price: '',
  area: '',
  areaUnit: 'sqft',
  bedrooms: '',
  bathrooms: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  locality: '',
  landmark: '',
  latitude: '',
  longitude: '',
};

export const useListingForm = (initialProperty?: Property) => {
  const [state, setState] = useState<ListingFormState>(defaultState);
  const [images, setImages] = useState<ListingImage[]>([]);
  useEffect(() => {
    if (!initialProperty) return;
    setState({
      listingType: initialProperty.listingType,
      propertyType: initialProperty.propertyType,
      title: initialProperty.title || '',
      description: initialProperty.description || '',
      price: initialProperty.price ?? '',
      area: initialProperty.area ?? '',
      areaUnit: initialProperty.areaUnit || 'sqft',
      bedrooms: initialProperty.bedrooms ?? '',
      bathrooms: initialProperty.bathrooms ?? '',
      address: initialProperty.location?.address || '',
      city: initialProperty.location?.city || '',
      state: initialProperty.location?.state || '',
      pincode: initialProperty.location?.pincode || '',
      locality: initialProperty.location?.locality || '',
      landmark: initialProperty.location?.landmark || '',
      latitude: initialProperty.location?.latitude ?? '',
      longitude: initialProperty.location?.longitude ?? '',
    });
    if (initialProperty.images?.length) {
      setImages(
        initialProperty.images
          .slice()
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((img) => ({
            id: img.id,
            previewUrl: img.imageUrl,
            uploadedUrl: img.imageUrl,
            isPrimary: !!img.isPrimary,
          })),
      );
    }
  }, [initialProperty]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await locationService.getAppConfig();
        setMapboxToken(config.mapboxToken || null);
      } catch {
        setMapboxToken(null);
      }
    };
    void loadConfig();
  }, []);

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!locationQuery || locationQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      // Don't fetch suggestions if we just applied one (i.e., if address is already filled)
      if (state.address && state.address.trim().length > 5) {
        setSuggestions([]);
        return;
      }
      try {
        const result = await locationService.autocomplete(locationQuery);
        setSuggestions(result);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [locationQuery, state.address]);

  const getFieldError = useCallback(
    <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => {
      switch (key) {
        case 'title':
          return String(value).trim().length < 5 ? 'Title is required (min 5 chars)' : '';
        case 'address':
          return String(value).trim().length < 5 ? 'Address is required' : '';
        case 'city':
          return String(value).trim().length < 2 ? 'City is required' : '';
        case 'state':
          return String(value).trim().length < 2 ? 'State is required' : '';
        case 'price':
          return value === '' || Number(value) <= 0 ? 'Valid price is required' : '';
        case 'area':
          return value === '' || Number(value) <= 0 ? 'Valid area is required' : '';
        default:
          return '';
      }
    },
    [],
  );

  const setField = useCallback(
    <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
      if (['title', 'address', 'city', 'state', 'price', 'area'].includes(key)) {
        const error = getFieldError(key, value);
        setErrors((prev) => {
          const next = { ...prev };
          if (error) {
            next[key] = error;
          } else {
            delete next[key];
          }
          return next;
        });
      }
    },
    [getFieldError],
  );

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: ListingImage[] = Array.from(files).slice(0, 20).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: false,
    }));
    setImages((prev) => {
      const merged = [...prev, ...next].slice(0, 20);
      if (!merged.some((i) => i.isPrimary) && merged.length > 0) merged[0].isPrimary = true;
      return merged;
    });
    setErrors((prev) => {
      if (!prev.images) return prev;
      const nextErrors = { ...prev };
      delete nextErrors.images;
      return nextErrors;
    });
  };

  const uploadSelected = async () => {
    const toUpload = images.filter((i) => i.file && !i.uploadedUrl).map((i) => i.file!);
    if (toUpload.length === 0) return;
    setLoading(true);
    try {
      const uploaded = await propertiesService.uploadPropertyImages(toUpload);
      let idx = 0;
      const next = images.map((i) => {
        if (i.uploadedUrl) return i;
        const url = uploaded[idx]?.url;
        idx += 1;
        return { ...i, uploadedUrl: url };
      });
      setImages(next);
      return next;
    } finally {
      setLoading(false);
    }
  };

  const setPrimary = (idx: number) => {
    setImages((prev) => prev.map((i, iIdx) => ({ ...i, isPrimary: iIdx === idx })));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((i) => i.isPrimary)) next[0].isPrimary = true;
      if (next.length === 0) {
        setErrors((prevErrors) => ({ ...prevErrors, images: 'Add at least one photo' }));
      }
      return next;
    });
  };

  const moveImage = (idx: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const target = idx + (direction === 'up' ? -1 : 1);
      if (target < 0 || target >= prev.length) return prev;
      const next = prev.slice();
      const tmp = next[idx];
      next[idx] = next[target];
      next[target] = tmp;
      return next;
    });
  };

  const reorderImages = (from: number, to: number) => {
    if (from === to) return;
    setImages((prev) => {
      if (from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const titleError = getFieldError('title', state.title);
    const addressError = getFieldError('address', state.address);
    const cityError = getFieldError('city', state.city);
    const stateError = getFieldError('state', state.state);
    const priceError = getFieldError('price', state.price);
    const areaError = getFieldError('area', state.area);
    if (titleError) next.title = titleError;
    if (addressError) next.address = addressError;
    if (cityError) next.city = cityError;
    if (stateError) next.state = stateError;
    if (priceError) next.price = priceError;
    if (areaError) next.area = areaError;
    if (images.length === 0) next.images = 'Add at least one photo';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const setFormError = (message: string) => {
    setErrors((prev) => ({ ...prev, form: message }));
  };

  const canSubmit = useMemo(() => {
    return (
      state.title.trim().length >= 5 &&
      state.address.trim().length >= 5 &&
      state.city.trim().length >= 2 &&
      state.state.trim().length >= 2 &&
      state.price !== '' &&
      Number(state.price) > 0 &&
      state.area !== '' &&
      Number(state.area) > 0 &&
      images.length > 0
    );
  }, [state, images]);

  const applySuggestion = (suggestion: LocationSuggestion) => {
    const [lng, lat] = suggestion.center;
    // 1. Update location query with selected place name
    setLocationQuery(suggestion.placeName);
    // 2. Immediately clear suggestions to remove the dropdown
    setSuggestions([]);
    // 3. Update latitude and longitude
    setField('latitude', lat);
    setField('longitude', lng);
    // Note: reverseGeocode will be called by the caller to fill in other address fields
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    const location = await locationService.reverse(lat, lng);
    if (!location) return;
    setField('address', location.formattedAddress || state.address);
    setField('city', location.city || state.city);
    setField('state', location.state || state.state);
    setField('pincode', location.pincode || state.pincode);
    setField('locality', location.locality || state.locality);
    setField('landmark', location.landmark || state.landmark);
    setField('latitude', location.coordinates?.latitude ?? lat);
    setField('longitude', location.coordinates?.longitude ?? lng);
  };

  const autodetectLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setField('latitude', latitude);
        setField('longitude', longitude);
        void reverseGeocode(latitude, longitude).finally(() => {
          setLoading(false);
        });
      },
      (error) => {
        setFormError(`Geolocation error: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const buildPayload = async (): Promise<CreatePropertyRequest> => {
    let imagesForPayload = images;
    if (images.some((i) => i.file && !i.uploadedUrl)) {
      imagesForPayload = (await uploadSelected()) || images;
    }

    return {
      listingType: state.listingType,
      propertyType: state.propertyType,
      title: state.title.trim(),
      description: state.description.trim() || undefined,
      price: Number(state.price),
      area: Number(state.area),
      areaUnit: state.areaUnit,
      bedrooms: state.bedrooms === '' ? undefined : Number(state.bedrooms),
      bathrooms: state.bathrooms === '' ? undefined : Number(state.bathrooms),
      location: {
        address: state.address.trim(),
        city: state.city.trim(),
        state: state.state.trim(),
        pincode: state.pincode.trim() || undefined,
        locality: state.locality.trim() || undefined,
        landmark: state.landmark.trim() || undefined,
        latitude: state.latitude === '' ? undefined : Number(state.latitude),
        longitude: state.longitude === '' ? undefined : Number(state.longitude),
      },
      images: imagesForPayload
        .filter((i) => i.uploadedUrl)
        .map((i, index) => ({
          imageUrl: i.uploadedUrl!,
          imageType: 'photo',
          displayOrder: index,
          isPrimary: i.isPrimary,
        })),
    };
  };

  return {
    state,
    setField,
    images,
    addFiles,
    uploadSelected,
    setPrimary,
    removeImage,
    moveImage,
    reorderImages,
    errors,
    validate,
    setFormError,
    canSubmit,
    loading,
    setLoading,
    mapboxToken,
    locationQuery,
    setLocationQuery,
    suggestions,
    applySuggestion,
    clearSuggestions,
    reverseGeocode,
    autodetectLocation,
    buildPayload,
  };
};


