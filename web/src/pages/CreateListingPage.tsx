import { useNavigate } from 'react-router-dom';
import { propertiesService } from '../services/properties.service';
import { ListingForm } from '../components/listing/ListingForm';
import { useListingForm } from '../hooks/useListingForm';
import './CreateListingPage.css';

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const {
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
    buildPayload,
    autodetectLocation,
  } = useListingForm();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = await buildPayload();
      await propertiesService.createProperty(payload);
      navigate('/my-listings');
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-listing-page">
      <div className="create-listing-container">
        <div className="create-listing-header">
          <h1>Create Listing</h1>
          <p>Fill the details carefully. You can submit for verification after saving.</p>
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
          onReorderImages={reorderImages}
          onValidate={validate}
          onSubmit={submit}
          onLocationQueryChange={setLocationQuery}
          onSuggestionSelect={(s) => {
            applySuggestion(s);
            void reverseGeocode(s.center[1], s.center[0]);
          }}
          onAutodetectLocation={autodetectLocation}
          onMapSelect={(lat, lng) => {
            setField('latitude', lat);
            setField('longitude', lng);
            clearSuggestions();
            void reverseGeocode(lat, lng);
          }}
          submitLabel="Save listing (Draft)"
        />
      </div>
    </div>
  );
};


