import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreatePropertyRequest, ListingType, PropertyType } from '../types/property';
import { propertiesService } from '../services/properties.service';
import './CreateListingPage.css';

type UiImage = { file: File; previewUrl: string; uploadedUrl?: string; isPrimary: boolean };

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [listingType, setListingType] = useState<ListingType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [area, setArea] = useState<number | ''>('');
  const [areaUnit, setAreaUnit] = useState('sqft');
  const [bedrooms, setBedrooms] = useState<number | ''>('');
  const [bathrooms, setBathrooms] = useState<number | ''>('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');

  const [images, setImages] = useState<UiImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationQuery, setLocationQuery] = useState('');

  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
  ];

  const validate = () => {
    const next: Record<string, string> = {};
    if (title.trim().length < 5) next.title = 'Title is required (min 5 chars)';
    if (address.trim().length < 5) next.address = 'Address is required';
    if (city.trim().length < 2) next.city = 'City is required';
    if (state.trim().length < 2) next.state = 'State is required';
    if (price === '' || Number(price) <= 0) next.price = 'Valid price is required';
    if (area === '' || Number(area) <= 0) next.area = 'Valid area is required';
    if (images.length === 0) next.images = 'Add at least one photo';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const canSubmit = useMemo(() => {
    return (
      title.trim().length >= 5 &&
      address.trim().length >= 5 &&
      city.trim().length >= 2 &&
      state.trim().length >= 2 &&
      price !== '' &&
      area !== '' &&
      images.length > 0 &&
      Object.keys(errors).length === 0
    );
  }, [title, address, city, state, price, area, images, errors]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: UiImage[] = Array.from(files).slice(0, 20).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: false,
    }));
    setImages((prev) => {
      const merged = [...prev, ...next].slice(0, 20);
      if (!merged.some((i) => i.isPrimary) && merged.length > 0) merged[0].isPrimary = true;
      return merged;
    });
  };

  const uploadSelected = async () => {
    setError(null);
    const toUpload = images.filter((i) => !i.uploadedUrl).map((i) => i.file);
    if (toUpload.length === 0) return;
    setLoading(true);
    try {
      const uploaded = await propertiesService.uploadPropertyImages(toUpload);
      let idx = 0;
      setImages((prev) =>
        prev.map((i) => {
          if (i.uploadedUrl) return i;
          const url = uploaded[idx]?.url;
          idx += 1;
          return { ...i, uploadedUrl: url };
        }),
      );
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to upload images.');
    } finally {
      setLoading(false);
    }
  };

  const useBrowserLocation = async () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
      },
      () => setError('Failed to get your current location.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      // Ensure images are uploaded
      if (images.some((i) => !i.uploadedUrl)) {
        await uploadSelected();
      }

      const payload: CreatePropertyRequest = {
        listingType,
        propertyType,
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        area: Number(area),
        areaUnit,
        bedrooms: bedrooms === '' ? undefined : Number(bedrooms),
        bathrooms: bathrooms === '' ? undefined : Number(bathrooms),
        location: {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim() || undefined,
          locality: locality.trim() || undefined,
          landmark: landmark.trim() || undefined,
          latitude: latitude === '' ? undefined : Number(latitude),
          longitude: longitude === '' ? undefined : Number(longitude),
        },
        images: images
          .filter((i) => i.uploadedUrl)
          .map((i, index) => ({
            imageUrl: i.uploadedUrl!,
            imageType: 'photo',
            displayOrder: index,
            isPrimary: i.isPrimary,
          })),
      };

      await propertiesService.createProperty(payload);
      navigate('/my-listings');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create listing.');
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
      return next;
    });
  };

  const useMapboxLookup = async () => {
    setError(null);
    if (!locationQuery.trim()) {
      setError('Enter a location to search');
      return;
    }
    try {
      const result = await propertiesService.geocodeLocation(locationQuery.trim());
      if (!result?.location) {
        setError('No results found for this location');
        return;
      }
      const loc = result.location;
      setAddress(loc.formattedAddress || address);
      setCity(loc.city || city);
      setState(loc.state || state);
      setPincode(loc.pincode || pincode);
      setLocality(loc.locality || locality);
      setLandmark(loc.landmark || landmark);
      setLatitude(loc.coordinates?.latitude ?? latitude);
      setLongitude(loc.coordinates?.longitude ?? longitude);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Mapbox lookup failed.');
    }
  };

  return (
    <div className="create-listing-page">
      <div className="create-listing-container">
        <div className="create-listing-header">
          <h1>Create Listing</h1>
          <p>Fill the details carefully. You can submit for verification after saving.</p>
        </div>

        <form className="create-listing-form" onSubmit={submit}>
          {error && <div className="create-listing-error">❌ {error}</div>}

          <section className="card">
            <h2>Basic</h2>
            <div className="grid">
              <label>
                Listing Type *
                <select value={listingType} onChange={(e) => setListingType(e.target.value as ListingType)}>
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </label>
              <label>
                Property Type *
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)}>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="col-span-2">
                Title *
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={validate}
                  placeholder="e.g., Spacious 2BHK near metro"
                />
                {errors.title && <span className="field-error">{errors.title}</span>}
              </label>
              <label className="col-span-2">
                Description (optional)
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </label>
            </div>
          </section>

          <section className="card">
            <h2>Location</h2>
            <div className="grid">
              <label className="col-span-2">
                Address *
                <input value={address} onChange={(e) => setAddress(e.target.value)} onBlur={validate} placeholder="Full address" />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </label>
              <label>
                City *
                <input value={city} onChange={(e) => setCity(e.target.value)} onBlur={validate} />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </label>
              <label>
                State *
                <select value={state} onChange={(e) => setState(e.target.value)} onBlur={validate}>
                  <option value="">Select state</option>
                  {indianStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && <span className="field-error">{errors.state}</span>}
              </label>
              <label>
                Pincode (optional)
                <input value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </label>
              <label>
                Locality (optional)
                <input value={locality} onChange={(e) => setLocality(e.target.value)} />
              </label>
              <label className="col-span-2">
                Landmark (optional)
                <input value={landmark} onChange={(e) => setLandmark(e.target.value)} />
              </label>

              <label className="col-span-2">
                Mapbox Location Lookup
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="e.g., Hitech City, Hyderabad"
                  />
                  <button type="button" className="secondary" onClick={useMapboxLookup}>
                    Find
                  </button>
                </div>
              </label>

              <div className="col-span-2 coords-row">
                <label>
                  Latitude (optional)
                  <input
                    type="number"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </label>
                <label>
                  Longitude (optional)
                  <input
                    type="number"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </label>
                <button type="button" className="secondary" onClick={useBrowserLocation}>
                  Use my location
                </button>
              </div>
            </div>
          </section>

          <section className="card">
            <h2>Details</h2>
            <div className="grid">
              <label>
                Price (₹) *
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  onBlur={validate}
                />
                {errors.price && <span className="field-error">{errors.price}</span>}
              </label>
              <label>
                Area *
                <input type="number" value={area} onChange={(e) => setArea(e.target.value === '' ? '' : Number(e.target.value))} onBlur={validate} />
                {errors.area && <span className="field-error">{errors.area}</span>}
              </label>
              <label>
                Area Unit
                <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)}>
                  <option value="sqft">sqft</option>
                  <option value="sqm">sqm</option>
                  <option value="acre">acre</option>
                  <option value="sqyrd">sqyrd</option>
                </select>
              </label>
              <label>
                Bedrooms (optional)
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </label>
              <label>
                Bathrooms (optional)
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </label>
            </div>
          </section>

          <section className="card">
            <h2>Images</h2>
            <div className="images-actions">
              <input type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
              <button type="button" className="secondary" onClick={uploadSelected} disabled={loading || images.length === 0}>
                Upload selected
              </button>
            </div>
            {errors.images && <div className="field-error">{errors.images}</div>}
            <div className="images-grid">
              {images.map((img, idx) => (
                <div key={img.previewUrl} className={`img-tile ${img.isPrimary ? 'primary' : ''}`}>
                  <img src={img.previewUrl} alt="preview" />
                  <div className="img-actions">
                    <button type="button" onClick={() => setPrimary(idx)}>
                      {img.isPrimary ? 'Primary' : 'Set Primary'}
                    </button>
                    <button type="button" onClick={() => removeImage(idx)}>
                      Remove
                    </button>
                  </div>
                  <div className="img-meta">{img.uploadedUrl ? '✅ Uploaded' : '⏳ Not uploaded'}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="submit-row">
            <button className="primary" type="submit" disabled={!canSubmit || loading}>
              {loading ? 'Saving...' : 'Save listing (Draft)'}
            </button>
            <button type="button" className="secondary" onClick={() => navigate('/my-listings')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


