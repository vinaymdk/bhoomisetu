import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buyerRequirementsService } from '../services/buyerRequirements.service';
import type { BudgetType } from '../types/buyerRequirement';
import './CreateBuyerRequirementPage.css';

const propertyTypes = ['apartment', 'house', 'villa', 'plot', 'commercial', 'industrial', 'agricultural', 'other'];
const listingTypes = ['sale', 'rent'];
const areaUnits = ['sqft', 'sqm', 'acre', 'sqyrd'];
const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
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
];
const titleSuggestions = ['3BHK near metro', 'Family home with parking', 'Commercial space on main road'];
const descriptionSuggestions = [
  'Prefer ready-to-move property with good ventilation.',
  'Need easy access to metro/bus stops and schools.',
  'Looking for verified listings with clear paperwork.',
];
const featureSuggestions = ['parking', 'lift', 'power-backup', 'east-facing', 'security'];

export const CreateBuyerRequirementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    state: '',
    locality: '',
    pincode: '',
    landmark: '',
    minBudget: '',
    maxBudget: '',
    budgetType: 'sale' as BudgetType,
    propertyType: '',
    listingType: '',
    minArea: '',
    maxArea: '',
    areaUnit: 'sqft',
    bedrooms: '',
    bathrooms: '',
    requiredFeatures: '',
    expiresInDays: '',
  });

  const hasAnyAdvanced = useMemo(
    () =>
      Boolean(
        form.propertyType ||
          form.listingType ||
          form.minArea ||
          form.maxArea ||
          form.bedrooms ||
          form.bathrooms ||
          form.requiredFeatures,
      ),
    [form],
  );

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.city.trim()) next.city = 'City is required';
    if (!form.state.trim()) next.state = 'State is required';
    if (!form.maxBudget || Number(form.maxBudget) <= 0) next.maxBudget = 'Max budget is required';
    if (form.minBudget && Number(form.minBudget) > Number(form.maxBudget)) {
      next.minBudget = 'Min budget cannot exceed max budget';
    }
    if (form.minArea && form.maxArea && Number(form.minArea) > Number(form.maxArea)) {
      next.minArea = 'Min area cannot exceed max area';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim() || undefined,
        description: form.description.trim() || undefined,
        location: {
          city: form.city.trim(),
          state: form.state.trim(),
          locality: form.locality.trim() || undefined,
          pincode: form.pincode.trim() || undefined,
          landmark: form.landmark.trim() || undefined,
        },
        minBudget: form.minBudget ? Number(form.minBudget) : undefined,
        maxBudget: Number(form.maxBudget),
        budgetType: form.budgetType,
        propertyType: form.propertyType || undefined,
        listingType: form.listingType || undefined,
        minArea: form.minArea ? Number(form.minArea) : undefined,
        maxArea: form.maxArea ? Number(form.maxArea) : undefined,
        areaUnit: form.areaUnit,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        requiredFeatures: form.requiredFeatures
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        expiresInDays: form.expiresInDays ? Number(form.expiresInDays) : undefined,
      };
      if (isEdit && id) {
        await buyerRequirementsService.update(id, payload);
      } else {
        await buyerRequirementsService.create(payload);
      }
      navigate('/buyer-requirements');
    } catch (err: any) {
      setErrors({ form: err?.response?.data?.message || 'Unable to save requirement.' });
    } finally {
      setLoading(false);
    }
  };

  const addSuggestion = (field: 'title' | 'description', value: string) => {
    if (!form[field].trim()) {
      setField(field, value);
      return;
    }
    setField(field, `${form[field].trim()} ${value}`);
  };

  const addFeatureSuggestion = (value: string) => {
    const existing = form.requiredFeatures
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (existing.includes(value)) return;
    const next = [...existing, value].join(', ');
    setField('requiredFeatures', next);
  };

  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      setPrefillLoading(true);
      try {
        const requirement = await buyerRequirementsService.getById(id);
        setForm({
          title: requirement.title ?? '',
          description: requirement.description ?? '',
          city: requirement.location.city ?? '',
          state: requirement.location.state ?? '',
          locality: requirement.location.locality ?? '',
          pincode: requirement.location.pincode ?? '',
          landmark: requirement.location.landmark ?? '',
          minBudget: requirement.budget.minBudget?.toString() ?? '',
          maxBudget: requirement.budget.maxBudget?.toString() ?? '',
          budgetType: requirement.budget.budgetType,
          propertyType: requirement.propertyDetails.propertyType ?? '',
          listingType: requirement.propertyDetails.listingType ?? '',
          minArea: requirement.propertyDetails.minArea?.toString() ?? '',
          maxArea: requirement.propertyDetails.maxArea?.toString() ?? '',
          areaUnit: requirement.propertyDetails.areaUnit ?? 'sqft',
          bedrooms: requirement.propertyDetails.bedrooms?.toString() ?? '',
          bathrooms: requirement.propertyDetails.bathrooms?.toString() ?? '',
          requiredFeatures: requirement.propertyDetails.requiredFeatures?.join(', ') ?? '',
          expiresInDays: '',
        });
      } catch (err: any) {
        setErrors({ form: err?.response?.data?.message || 'Unable to load requirement.' });
      } finally {
        setPrefillLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  return (
    <div className="buyer-req-create">
      <div className="buyer-req-create-header">
        <div>
          <h1>{isEdit ? 'Edit Buyer Requirement' : 'Post Buyer Requirement'}</h1>
          <p>Tell us what you need. We will match verified listings to your requirement.</p>
        </div>
        <button className="outline-btn" onClick={() => navigate('/buyer-requirements')}>
          Back to Requirements
        </button>
      </div>

      {prefillLoading ? (
        <div className="buyer-req-state">Loading requirement...</div>
      ) : (
        <form className="buyer-req-form" onSubmit={handleSubmit}>
        <div className="form-card">
          <h3>Requirement Summary</h3>
          <div className="field-grid">
            <div>
              <label>Title</label>
              <input
                value={form.title}
                onChange={(event) => setField('title', event.target.value)}
                placeholder="e.g., 3BHK near metro"
              />
              <div className="suggestions-row">
                {titleSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => addSuggestion('title', suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Description</label>
              <input
                value={form.description}
                onChange={(event) => setField('description', event.target.value)}
                placeholder="Any special notes or constraints"
              />
              <div className="suggestions-row">
                {descriptionSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => addSuggestion('description', suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3>Location *</h3>
          <div className="field-grid">
            <div>
              <label>City *</label>
              <input value={form.city} onChange={(event) => setField('city', event.target.value)} />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
            <div>
              <label>State *</label>
              <select value={form.state} onChange={(event) => setField('state', event.target.value)}>
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && <span className="field-error">{errors.state}</span>}
            </div>
            <div>
              <label>Locality</label>
              <input value={form.locality} onChange={(event) => setField('locality', event.target.value)} />
            </div>
            <div>
              <label>Pincode</label>
              <input value={form.pincode} onChange={(event) => setField('pincode', event.target.value)} />
            </div>
            <div>
              <label>Landmark</label>
              <input value={form.landmark} onChange={(event) => setField('landmark', event.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3>Budget *</h3>
          <div className="field-grid">
            <div>
              <label>Min Budget</label>
              <input
                type="number"
                value={form.minBudget}
                onChange={(event) => setField('minBudget', event.target.value)}
                placeholder="Optional"
              />
              {errors.minBudget && <span className="field-error">{errors.minBudget}</span>}
            </div>
            <div>
              <label>Max Budget *</label>
              <input
                type="number"
                value={form.maxBudget}
                onChange={(event) => setField('maxBudget', event.target.value)}
                placeholder="Required"
              />
              {errors.maxBudget && <span className="field-error">{errors.maxBudget}</span>}
            </div>
            <div>
              <label>Budget Type</label>
              <select value={form.budgetType} onChange={(event) => setField('budgetType', event.target.value)}>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3>Property Preferences {hasAnyAdvanced ? '' : '(Optional)'}</h3>
          <div className="field-grid">
            <div>
              <label>Property Type</label>
              <select value={form.propertyType} onChange={(event) => setField('propertyType', event.target.value)}>
                <option value="">Any</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Listing Type</label>
              <select value={form.listingType} onChange={(event) => setField('listingType', event.target.value)}>
                <option value="">Any</option>
                {listingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Min Area</label>
              <input type="number" value={form.minArea} onChange={(event) => setField('minArea', event.target.value)} />
              {errors.minArea && <span className="field-error">{errors.minArea}</span>}
            </div>
            <div>
              <label>Max Area</label>
              <input type="number" value={form.maxArea} onChange={(event) => setField('maxArea', event.target.value)} />
            </div>
            <div>
              <label>Area Unit</label>
              <select value={form.areaUnit} onChange={(event) => setField('areaUnit', event.target.value)}>
                {areaUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={(event) => setField('bedrooms', event.target.value)} />
            </div>
            <div>
              <label>Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={(event) => setField('bathrooms', event.target.value)} />
            </div>
            <div>
              <label>Required Features</label>
              <input
                value={form.requiredFeatures}
                onChange={(event) => setField('requiredFeatures', event.target.value)}
                placeholder="e.g., parking, lift, east-facing"
              />
              <div className="suggestions-row">
                {featureSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => addFeatureSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <span className="field-hint">Comma-separated values</span>
            </div>
            <div>
              <label>Expires In (Days)</label>
              <input
                type="number"
                value={form.expiresInDays}
                onChange={(event) => setField('expiresInDays', event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {errors.form && <div className="form-error">{errors.form}</div>}
        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Requirement' : 'Post Requirement'}
        </button>
      </form>
      )}
    </div>
  );
};

