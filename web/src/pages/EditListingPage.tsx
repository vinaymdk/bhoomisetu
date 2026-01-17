import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertiesService } from '../services/properties.service';
import type { Property } from '../types/property';
import { ListingForm } from '../components/listing/ListingForm';
import { useListingForm } from '../hooks/useListingForm';
import './CreateListingPage.css';

export const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoadingProperty(true);
      try {
        const data = await propertiesService.getPropertyById(id);
        setProperty(data);
      } finally {
        setLoadingProperty(false);
      }
    };
    void load();
  }, [id]);

  const {
    state,
    setField,
    images,
    addFiles,
    uploadSelected,
    setPrimary,
    removeImage,
    moveImage,
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
    reverseGeocode,
    buildPayload,
  } = useListingForm(property || undefined);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!id) return;
    setLoading(true);
    try {
      const payload = await buildPayload();
      await propertiesService.updateProperty(id, payload);
      navigate('/my-listings');
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to update listing.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="create-listing-page">
        <div className="create-listing-container">
          <div className="create-listing-header">
            <h1>Edit Listing</h1>
            <p>Loading property...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="create-listing-page">
        <div className="create-listing-container">
          <div className="create-listing-header">
            <h1>Edit Listing</h1>
            <p>Property not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-listing-page">
      <div className="create-listing-container">
        <div className="create-listing-header">
          <h1>Edit Listing</h1>
          <p>Update details and reorder images.</p>
        </div>
        <ListingForm
          state={state}
          images={images}
          errors={errors}
          loading={loading}
          canSubmit={canSubmit}
          mapboxToken={mapboxToken}
          locationQuery={locationQuery}
          suggestions={suggestions}
          onChange={setField}
          onAddFiles={addFiles}
          onUploadSelected={uploadSelected}
          onSetPrimary={setPrimary}
          onRemoveImage={removeImage}
          onMoveImage={moveImage}
          onValidate={validate}
          onSubmit={submit}
          onLocationQueryChange={setLocationQuery}
          onSuggestionSelect={(s) => {
            applySuggestion(s);
            void reverseGeocode(s.center[1], s.center[0]);
          }}
          onMapSelect={(lat, lng) => {
            setField('latitude', lat);
            setField('longitude', lng);
            void reverseGeocode(lat, lng);
          }}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
};


