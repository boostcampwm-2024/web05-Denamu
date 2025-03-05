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
  PlatformSelector: vi.fn().mockImplementation(({ platform, onPlatformChange }) => (
    <div>
      <select value={platform} onChange={(e) => onPlatformChange(e.target.value)} aria-label="플랫폼 선택">
        <option value="tistory">Tistory</option>
        <option value="medium">Medium</option>
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
