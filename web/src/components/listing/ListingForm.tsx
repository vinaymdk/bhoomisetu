import type { ListingFormState } from '../../hooks/useListingForm';
import type { ListingType, PropertyType } from '../../types/property';
import { useState } from 'react';
import { MapPicker } from '../location/MapPicker';
import './ListingForm.css';

interface ListingFormProps {
  state: ListingFormState;
  images: any[];
  errors: Record<string, string>;
  loading: boolean;
  canSubmit: boolean;
  mapboxToken?: string | null;
  locationQuery: string;
  suggestions: { id: string; name: string; placeName: string; center: [number, number] }[];
  onChange: <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => void;
  onAddFiles: (files: FileList | null) => void;
  onUploadSelected: () => void;
  onSetPrimary: (idx: number) => void;
  onRemoveImage: (idx: number) => void;
  onMoveImage: (idx: number, direction: 'up' | 'down') => void;
  onReorderImages: (from: number, to: number) => void;
  onValidate: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onLocationQueryChange: (value: string) => void;
  onSuggestionSelect: (suggestion: ListingFormProps['suggestions'][0]) => void;
  onMapSelect: (lat: number, lng: number) => void;
  onAutodetectLocation: () => void;
  submitLabel: string;
}

export const ListingForm = ({
  state,
  images,
  errors,
  loading,
  canSubmit,
  mapboxToken,
  locationQuery,
  suggestions,
  onChange,
  onAddFiles,
  onUploadSelected,
  onSetPrimary,
  onRemoveImage,
  onMoveImage,
  onReorderImages,
  onValidate,
  onSubmit,
  onLocationQueryChange,
  onSuggestionSelect,
  onMapSelect,
  onAutodetectLocation,
  submitLabel,
}: ListingFormProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDrop = (targetIdx: number) => {
    if (dragIndex == null || dragIndex === targetIdx) return;
    onReorderImages(dragIndex, targetIdx);
    setDragIndex(null);
  };

  const indianStates = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh',
    'Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand',
    'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
    'Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
    'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
  ];

  return (
    <form className="create-listing-form" onSubmit={onSubmit}>
      {errors.form && <div className="create-listing-error">❌ {errors.form}</div>}

      {/* --- Basic Section --- */}
      <section className="card">
        <h2>Basic</h2>
        <div className="grid">
          <label>
            Listing Type *
            <select value={state.listingType} onChange={(e) => onChange('listingType', e.target.value as ListingType)}>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </label>
          <label>
            Property Type *
            <select value={state.propertyType} onChange={(e) => onChange('propertyType', e.target.value as PropertyType)}>
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
            <input value={state.title} onChange={(e) => onChange('title', e.target.value)} onBlur={onValidate} placeholder="e.g., Spacious 2BHK near metro" />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </label>
          <label className="col-span-2">
            Description (optional)
            <textarea value={state.description} onChange={(e) => onChange('description', e.target.value)} rows={4} />
          </label>
        </div>
      </section>

      {/* --- Location Section --- */}

       <section className="card">
         <h2>Location</h2>
         <div className="grid">
           <label className="col-span-2">
             Address *
             <input value={state.address} onChange={(e) => onChange('address', e.target.value)} onBlur={onValidate} placeholder="Full address" />
             {errors.address && <span className="field-error">{errors.address}</span>}
           </label>
           <label>
             City *
             <input value={state.city} onChange={(e) => onChange('city', e.target.value)} onBlur={onValidate} />
             {errors.city && <span className="field-error">{errors.city}</span>}
           </label>
           <label>
             State *
             <select value={state.state} onChange={(e) => onChange('state', e.target.value)} onBlur={onValidate}>
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
            <input value={state.pincode} onChange={(e) => onChange('pincode', e.target.value)} />
          </label>
          <label>
            Locality (optional)
            <input value={state.locality} onChange={(e) => onChange('locality', e.target.value)} />
          </label>
          <label className="col-span-2">
            Landmark (optional)
            <input value={state.landmark} onChange={(e) => onChange('landmark', e.target.value)} />
          </label>

          <div className="col-span-2 location-actions">
            <label>
              Location Search
              <input value={locationQuery} onChange={(e) => onLocationQueryChange(e.target.value)} placeholder="Search location" />
            </label>
            <button type="button" onClick={onAutodetectLocation} disabled={loading} className="icon-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
              <span>Use my location</span>
            </button>
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((s) => (
                  <button key={s.id} type="button" className="suggestion-item" onClick={() => onSuggestionSelect(s)}>
                    <strong>{s.name}</strong>
                    <span>{s.placeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-2">
            <MapPicker
              mapboxToken={mapboxToken}
              latitude={state.latitude === '' ? undefined : Number(state.latitude)}
              longitude={state.longitude === '' ? undefined : Number(state.longitude)}
              onSelect={onMapSelect}
            />
          </div>

          {/* <div className="col-span-2 coords-row">
            <label>
              Latitude (optional)
              <input
                type="number"
                value={state.latitude}
                onChange={(e) => onChange('latitude', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </label>
            <label>
              Longitude (optional)
              <input
                type="number"
                value={state.longitude}
                onChange={(e) => onChange('longitude', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </label>
          </div> */}
        </div>
      </section>

      {/* <section className="card">
        <h2>Location</h2>
        <div className="grid">
          <label className="col-span-2">
            Address *
            <input value={state.address} onChange={(e) => onChange('address', e.target.value)} onBlur={onValidate} placeholder="Full address" />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </label>
          <label>City *<input value={state.city} onChange={(e) => onChange('city', e.target.value)} onBlur={onValidate} /></label>
          <label>State *
            <select value={state.state} onChange={(e) => onChange('state', e.target.value)} onBlur={onValidate}>
              <option value="">Select state</option>
              {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <div className="col-span-2 location-actions">
            <input value={locationQuery} onChange={(e) => onLocationQueryChange(e.target.value)} placeholder="Search location" />
            <button type="button" onClick={onAutodetectLocation} disabled={loading}>Use my location</button>
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((s) => (
                  <button key={s.id} type="button" onClick={() => onSuggestionSelect(s)}>
                    <strong>{s.name}</strong> <span>{s.placeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <MapPicker
            mapboxToken={mapboxToken}
            latitude={state.latitude === '' ? undefined : Number(state.latitude)}
            longitude={state.longitude === '' ? undefined : Number(state.longitude)}
            onSelect={onMapSelect}
          />
        </div>
      </section> */}

      {/* --- Details Section --- */}
      {/* <section className="card">
        <h2>Details</h2>
        <div className="grid">
          <label>Price (₹) *<input type="number" value={state.price} onChange={(e) => onChange('price', e.target.value === '' ? '' : Number(e.target.value))} onBlur={onValidate} /></label>
          <label>Area *<input type="number" value={state.area} onChange={(e) => onChange('area', e.target.value === '' ? '' : Number(e.target.value))} onBlur={onValidate} /></label>
          <label>Area Unit *
            <select value={state.areaUnit} onChange={(e) => onChange('areaUnit', e.target.value)}>
              <option value="sqft">sqft</option>
              <option value="sqm">sqm</option>
              <option value="acre">acre</option>
              <option value="sqyrd">sqyrd</option>
            </select>
          </label>
        </div>
      </section> */}

      {/* --- Images Section --- */}
      {/* <section className="card">
        <h2>Images</h2>
        <div className="images-actions">
          <input type="file" accept="image/*" multiple onChange={(e) => onAddFiles(e.target.files)} />
          <button type="button" onClick={onUploadSelected} disabled={loading || images.length === 0}>Upload selected</button>
        </div>
        <div className="images-grid">
          {images.map((img, idx) => (
            <div
              key={img.previewUrl}
              className={`img-tile ${img.isPrimary ? 'primary' : ''} ${dragIndex === idx ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => { setDragIndex(idx); e.dataTransfer.setData('text/plain', String(idx)); }}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); handleDrop(idx); }}
              onDragEnd={() => setDragIndex(null)}
            >
              <img src={img.previewUrl} alt="preview" />
                <div className="img-actions">
                  <button type="button" onClick={() => onSetPrimary(idx)}>
                    {img.isPrimary ? 'Primary' : 'Set Primary'}
                  </button>
                  <button type="button" onClick={() => onMoveImage(idx, 'up')} disabled={idx === 0}>
                    Up
                  </button>
                  <button type="button" onClick={() => onMoveImage(idx, 'down')} disabled={idx === images.length - 1}>
                    Down
                  </button>
                  <button type="button" className="img-action-remove" onClick={() => onRemoveImage(idx)}>
                    Remove
                  </button>
                </div>
              <div className="img-meta">{img.uploadedUrl ? '✅ Uploaded' : '⏳ Not uploaded'}</div>
            </div>
          ))}
        </div>
      </section> */}


<section className="card">
        <h2>Details</h2>
        <div className="grid">
          <label>
            Price (₹) *
            <input
              type="number"
              value={state.price}
              onChange={(e) => onChange('price', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={onValidate}
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </label>
          <label>
            Area *
            <input
              type="number"
              value={state.area}
              onChange={(e) => onChange('area', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={onValidate}
            />
            {errors.area && <span className="field-error">{errors.area}</span>}
          </label>
          <label>
            Area Unit *
            <select value={state.areaUnit} onChange={(e) => onChange('areaUnit', e.target.value)}>
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
              value={state.bedrooms}
              onChange={(e) => onChange('bedrooms', e.target.value === '' ? '' : Number(e.target.value))}
            />
          </label>
          <label>
            Bathrooms (optional)
            <input
              type="number"
              value={state.bathrooms}
              onChange={(e) => onChange('bathrooms', e.target.value === '' ? '' : Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Images</h2>
        <div className="images-actions">
          <input type="file" accept="image/*" multiple onChange={(e) => onAddFiles(e.target.files)} />
          <button type="button" className="secondary" onClick={onUploadSelected} disabled={loading || images.length === 0}>
            Upload selected
          </button>
        </div>
        {errors.images && <div className="field-error">{errors.images}</div>}
        <div className="images-grid">
          {images.map((img, idx) => (
            <div
              key={img.previewUrl}
              className={`img-tile ${img.isPrimary ? 'primary' : ''} ${dragIndex === idx ? 'dragging' : ''}`}
              draggable="true"
              onDragStart={(e) => {
                setDragIndex(idx);
                e.dataTransfer!.effectAllowed = 'move';
                e.dataTransfer!.setData('text/plain', String(idx));
                if (e.dataTransfer!.setDragImage) {
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement;
                  if (img) e.dataTransfer!.setDragImage(img, 0, 0);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer!.dropEffect = 'move';
                (e.currentTarget as HTMLElement).style.opacity = '0.5';
              }}
              onDragLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                (e.currentTarget as HTMLElement).style.opacity = '1';
                const from = Number(e.dataTransfer!.getData('text/plain'));
                if (!Number.isNaN(from) && from !== idx) {
                  onReorderImages(from, idx);
                }
                setDragIndex(null);
              }}
              onDragEnd={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
                setDragIndex(null);
              }}
              aria-grabbed={dragIndex === idx}
            >
              <span className="drag-handle" title="Drag to reorder" aria-hidden="true">
                ≡
              </span>
              <img src={img.previewUrl} alt="preview" draggable={false} />
              <div className="img-actions">
                <button type="button" onClick={() => onSetPrimary(idx)}>
                  {img.isPrimary ? 'Primary' : 'Set Primary'}
                </button>
                <button type="button" onClick={() => onMoveImage(idx, 'up')} disabled={idx === 0}>
                  Up
                </button>
                <button type="button" onClick={() => onMoveImage(idx, 'down')} disabled={idx === images.length - 1}>
                  Down
                </button>
                <button type="button" className="img-action-remove" onClick={() => onRemoveImage(idx)}>
                  Remove
                </button>
              </div>
              <div className="img-meta">{img.uploadedUrl ? '✅ Uploaded' : '⏳ Not uploaded'}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="submit-row">
        <button className="primary" type="submit" disabled={loading || !canSubmit}>{loading ? 'Saving...' : submitLabel}</button>
      </div>
    </form>
  );
};

