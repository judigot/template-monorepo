import type { ReactNode } from 'react';
import { useState } from 'react';
import { FormField } from './FormField.tsx';
import {
  CheckboxGroup,
  Combobox,
  DatePicker,
  PasswordInput,
  RadioGroup,
} from './FormPrimitives.tsx';
import { Modal } from './Modal.tsx';
import { TagInput } from './TagInput.tsx';

const TAG_SUGGESTIONS = [
  'React',
  'TypeScript',
  'Vite',
  'Design system',
  'Accessibility',
];

export function Showcase(): ReactNode {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
  const [isToggled, setIsToggled] = useState(true);
  const [tags, setTags] = useState(['React', 'Design system']);
  const [notice, setNotice] = useState('');
  const [role, setRole] = useState('');
  const [updates, setUpdates] = useState<string[]>(['email']);

  return (
    <section className="ui-showcase" aria-labelledby="showcase-title">
      <header className="ui-showcase__header">
        <p className="ui-eyebrow">Frontend kitchen sink</p>
        <h2 id="showcase-title">Design system showcase</h2>
        <p>
          Reusable components and tokens inspired by the BigBang and STP
          style-guide pages.
        </p>
      </header>
      <button
        className="ui-button ui-button--info ui-showcase__open-modal"
        type="button"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Open modal
      </button>
      <div className="ui-showcase__grid">
        <article className="ui-showcase__panel ui-showcase__panel--wide">
          <h3>Buttons</h3>
          <div className="ui-showcase__row">
            <button
              className="ui-button ui-button--primary"
              type="button"
              onClick={() => {
                setNotice('Primary action selected');
              }}
            >
              Primary
            </button>
            <button
              className="ui-button ui-button--secondary"
              type="button"
              onClick={() => {
                setNotice('Default action selected');
              }}
            >
              Default
            </button>
            <button
              className="ui-button ui-button--success"
              type="button"
              onClick={() => {
                setNotice('Success action selected');
              }}
            >
              Success
            </button>
            <button
              className="ui-button ui-button--danger"
              type="button"
              onClick={() => {
                setNotice('Danger action selected');
              }}
            >
              Danger
            </button>
          </div>
          {notice ? (
            <output className="ui-showcase__notice">{notice}</output>
          ) : null}
        </article>
        <article className="ui-showcase__panel">
          <h3>Toggle switch</h3>
          <label className="ui-switch">
            <input
              type="checkbox"
              checked={isToggled}
              onChange={(event) => {
                setIsToggled(event.target.checked);
              }}
            />
            <span className="ui-switch__track" />
            <span>{isToggled ? 'Enabled' : 'Disabled'}</span>
          </label>
        </article>
        <article className="ui-showcase__panel">
          <h3>Tokens</h3>
          <div className="ui-token-swatches">
            <span className="ui-token-swatch ui-token-swatch--primary">
              Primary
            </span>
            <span className="ui-token-swatch ui-token-swatch--surface">
              Surface
            </span>
            <span className="ui-token-swatch ui-token-swatch--danger">
              Danger
            </span>
          </div>
          <p className="ui-form-help">
            Spacing, color, radius, and typography are provided by the
            design-system package.
          </p>
        </article>
        <article className="ui-showcase__panel ui-showcase__panel--wide">
          <h3>Tag input</h3>
          <TagInput
            id="showcase-tags"
            label="Technologies"
            onChange={setTags}
            suggestions={TAG_SUGGESTIONS}
            tags={tags}
          />
        </article>
        <article className="ui-showcase__panel ui-showcase__panel--wide">
          <h3>Form primitives</h3>
          <div className="ui-showcase__form-grid">
            <FormField
              description="Use a work email."
              htmlFor="showcase-email"
              label="Email"
            >
              <input
                className="ui-form-control"
                id="showcase-email"
                type="email"
              />
            </FormField>
            <Combobox
              id="showcase-role"
              label="Role"
              onChange={setRole}
              options={[
                { label: 'Designer', value: 'designer' },
                { label: 'Engineer', value: 'engineer' },
              ]}
              value={role}
            />
            <FormField htmlFor="showcase-password" label="Password">
              <PasswordInput id="showcase-password" />
            </FormField>
            <FormField htmlFor="showcase-date" label="Start date">
              <DatePicker id="showcase-date" />
            </FormField>
            <RadioGroup
              legend="Delivery"
              name="showcase-delivery"
              onChange={() => undefined}
              options={[
                { label: 'Email', value: 'email' },
                { label: 'SMS', value: 'sms' },
              ]}
              value="email"
            />
            <CheckboxGroup
              legend="Updates"
              onChange={setUpdates}
              options={[
                { label: 'Email', value: 'email' },
                { label: 'SMS', value: 'sms' },
              ]}
              values={updates}
            />
          </div>
        </article>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsNestedModalOpen(false);
          setIsModalOpen(false);
        }}
        title="Blank modal"
        footer={
          <>
            <button
              className="ui-button ui-button--secondary"
              type="button"
              onClick={() => {
                setIsNestedModalOpen(false);
                setIsModalOpen(false);
              }}
            >
              Close
            </button>
            <button
              className="ui-button ui-button--primary"
              type="button"
              onClick={() => {
                setNotice('Modal confirmed');
                setIsModalOpen(false);
              }}
            >
              Confirm
            </button>
          </>
        }
      >
        <p>
          This reusable modal mirrors the showcase interaction from BigBang
          while using the accessible native dialog implementation.
        </p>
        <button
          className="ui-button ui-button--secondary"
          type="button"
          onClick={() => {
            setIsNestedModalOpen(true);
          }}
        >
          Open nested modal
        </button>
      </Modal>
      <Modal
        isOpen={isNestedModalOpen}
        onClose={() => {
          setIsNestedModalOpen(false);
        }}
        title="Nested modal"
        footer={
          <button
            className="ui-button ui-button--primary"
            type="button"
            onClick={() => {
              setIsNestedModalOpen(false);
            }}
          >
            Done
          </button>
        }
      >
        <p>
          The nested dialog stays above its parent and returns focus to its
          trigger when closed.
        </p>
      </Modal>
    </section>
  );
}
