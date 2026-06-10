import { vi } from "vitest";

export const mockFormInput = {
  FormInput: vi.fn().mockImplementation(({ id, label, value, onChange, type = "text", placeholder }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </div>
  )),
};

export const mockPlatformSelector = {
  BlogPlatformSelector: vi.fn().mockImplementation(({ platforms, value, onChange }) => (
    <div>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label="플랫폼 선택">
        {platforms?.map((p: { value: string; label: string }) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
    </div>
  )),
};

export const mockRssUrlInput = {
  RssUrlInput: vi.fn().mockImplementation(({ value, onChange }) => (
    <div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} aria-label="RSS URL" />
    </div>
  )),
};
