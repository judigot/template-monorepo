import { Modal, TagInput } from '@monorepo/components';
import type { ReactNode, SyntheticEvent } from 'react';
import { useState } from 'react';

interface IProfileFormState {
  bio: string;
  deliveryPreference: 'email' | 'sms';
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  startDate: string;
  termsAccepted: boolean;
  tags: string[];
  website: string;
}

const INITIAL_PROFILE: IProfileFormState = {
  bio: '',
  deliveryPreference: 'email',
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: '',
  startDate: '',
  termsAccepted: false,
  tags: [],
  website: '',
};

type ITextProfileField = Exclude<
  keyof IProfileFormState,
  'deliveryPreference' | 'termsAccepted' | 'tags'
>;

export function ProfileForm(): ReactNode {
  const [profile, setProfile] = useState<IProfileFormState>(INITIAL_PROFILE);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [tagError, setTagError] = useState('');

  const updateTextField = (field: ITextProfileField, value: string): void => {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (profile.tags.length === 0) {
      setTagError('Add at least one technology.');
      return;
    }
    setTagError('');
    setIsReviewOpen(true);
  };

  const handleConfirmSave = (): void => {
    setIsReviewOpen(false);
    setIsSaved(true);
  };

  const handleReset = (): void => {
    setProfile(INITIAL_PROFILE);
    setIsSaved(false);
    setTagError('');
  };

  return (
    <>
      <form className="ui-form-card" onSubmit={handleSubmit}>
        <header className="ui-form-header">
          <h2>Profile details</h2>
          <p>Provide the information your team needs to contact you.</p>
        </header>

        <div className="ui-form-grid">
          <label className="ui-form-field" htmlFor="profile-first-name">
            <span className="ui-form-label">First name</span>
            <input
              aria-label="First name"
              className="ui-form-control"
              id="profile-first-name"
              onChange={(event) => {
                updateTextField('firstName', event.target.value);
              }}
              required
              value={profile.firstName}
            />
          </label>
          <label className="ui-form-field" htmlFor="profile-last-name">
            <span className="ui-form-label">Last name</span>
            <input
              aria-label="Last name"
              className="ui-form-control"
              id="profile-last-name"
              onChange={(event) => {
                updateTextField('lastName', event.target.value);
              }}
              required
              value={profile.lastName}
            />
          </label>
          <label
            className="ui-form-field ui-form-field--full"
            htmlFor="profile-email"
          >
            <span className="ui-form-label">Email address</span>
            <input
              aria-label="Email address"
              autoComplete="email"
              className="ui-form-control"
              id="profile-email"
              onChange={(event) => {
                updateTextField('email', event.target.value);
              }}
              required
              type="email"
              value={profile.email}
            />
            <span className="ui-form-help">
              Used for account notifications.
            </span>
          </label>
          <label className="ui-form-field" htmlFor="profile-phone">
            <span className="ui-form-label">Phone number</span>
            <input
              aria-label="Phone number"
              autoComplete="tel"
              className="ui-form-control"
              id="profile-phone"
              onChange={(event) => {
                updateTextField('phone', event.target.value);
              }}
              type="tel"
              value={profile.phone}
            />
          </label>
          <label className="ui-form-field" htmlFor="profile-role">
            <span className="ui-form-label">Role</span>
            <select
              aria-label="Role"
              className="ui-form-control"
              id="profile-role"
              onChange={(event) => {
                updateTextField('role', event.target.value);
              }}
              required
              value={profile.role}
            >
              <option value="">Choose a role</option>
              <option value="designer">Designer</option>
              <option value="engineer">Engineer</option>
              <option value="operations">Operations</option>
            </select>
          </label>
          <label className="ui-form-field" htmlFor="profile-start-date">
            <span className="ui-form-label">Start date</span>
            <input
              aria-label="Start date"
              className="ui-form-control"
              id="profile-start-date"
              onChange={(event) => {
                updateTextField('startDate', event.target.value);
              }}
              type="date"
              value={profile.startDate}
            />
          </label>
          <label className="ui-form-field" htmlFor="profile-website">
            <span className="ui-form-label">Website</span>
            <input
              aria-label="Website"
              className="ui-form-control"
              id="profile-website"
              onChange={(event) => {
                updateTextField('website', event.target.value);
              }}
              placeholder="https://example.com"
              type="url"
              value={profile.website}
            />
          </label>
          <fieldset className="ui-form-options ui-form-field--full">
            <legend className="ui-form-legend">Preferred updates</legend>
            <label className="ui-form-option">
              <input
                checked={profile.deliveryPreference === 'email'}
                name="deliveryPreference"
                onChange={() => {
                  setProfile((currentProfile) => ({
                    ...currentProfile,
                    deliveryPreference: 'email',
                  }));
                  setIsSaved(false);
                }}
                type="radio"
                value="email"
              />
              Email
            </label>
            <label className="ui-form-option">
              <input
                checked={profile.deliveryPreference === 'sms'}
                name="deliveryPreference"
                onChange={() => {
                  setProfile((currentProfile) => ({
                    ...currentProfile,
                    deliveryPreference: 'sms',
                  }));
                  setIsSaved(false);
                }}
                type="radio"
                value="sms"
              />
              SMS
            </label>
          </fieldset>
          <label
            className="ui-form-field ui-form-field--full"
            htmlFor="profile-bio"
          >
            <span className="ui-form-label">About you</span>
            <textarea
              aria-label="About you"
              className="ui-form-control"
              onChange={(event) => {
                updateTextField('bio', event.target.value);
              }}
              rows={4}
              id="profile-bio"
              value={profile.bio}
            />
          </label>
          <div className="ui-form-field ui-form-field--full">
            <TagInput
              id="profile-tags"
              label="Technologies"
              onChange={(tags) => {
                setProfile((currentProfile) => ({ ...currentProfile, tags }));
                setTagError('');
                setIsSaved(false);
              }}
              suggestions={[
                'React',
                'TypeScript',
                'Vite',
                'Design system',
                'Accessibility',
              ]}
              tags={profile.tags}
            />
            {tagError ? (
              <span className="ui-form-error" role="alert">
                {tagError}
              </span>
            ) : (
              <span className="ui-form-help">Add the tools you use most.</span>
            )}
          </div>
          <label className="ui-checkbox ui-form-field--full">
            <input
              checked={profile.termsAccepted}
              onChange={(event) => {
                setProfile((currentProfile) => ({
                  ...currentProfile,
                  termsAccepted: event.target.checked,
                }));
                setIsSaved(false);
              }}
              required
              type="checkbox"
            />
            <span>I agree to receive account-related communications.</span>
          </label>
        </div>

        <footer className="ui-form-actions">
          {isSaved ? (
            <output className="ui-form-success">Profile saved.</output>
          ) : null}
          <button
            className="ui-button ui-button--secondary"
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
          <button className="ui-button ui-button--primary" type="submit">
            Save profile
          </button>
        </footer>
      </form>

      <Modal
        footer={
          <>
            <button
              className="ui-button ui-button--secondary"
              onClick={() => {
                setIsReviewOpen(false);
              }}
              type="button"
            >
              Keep editing
            </button>
            <button
              className="ui-button ui-button--primary"
              onClick={handleConfirmSave}
              type="button"
            >
              Confirm save
            </button>
          </>
        }
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
        }}
        title="Review profile"
      >
        <p>
          Save profile details for {profile.firstName} {profile.lastName}?
        </p>
        <p className="ui-form-help">Technologies: {profile.tags.join(', ')}</p>
      </Modal>
    </>
  );
}
