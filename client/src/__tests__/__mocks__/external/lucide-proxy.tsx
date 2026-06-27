import { createElement } from "react";

/**
 * lucide-react 전체를 임의 아이콘 이름에 대응하는 stub 컴포넌트로 대체한다.
 * 전역 setup.tsx 의 lucide mock 은 일부 아이콘만 정의하므로, 정의되지 않은
 * 아이콘을 사용하는 컴포넌트를 테스트할 때 이 Proxy 로 파일 단위 override 한다.
 *
 * 사용: vi.mock("lucide-react", () => lucideProxy());
 * 각 아이콘은 data-testid="lucide-<IconName>" 인 <span> 으로 렌더된다.
 *
 * 주의:
 * - `then` 등 소문자 시작 키는 컴포넌트로 만들지 않는다. `then`을 함수로 반환하면
 *   모듈이 thenable로 오인되어 vitest의 await가 영원히 hang된다.
 * - vitest는 named import(`import { X } from "lucide-react"`) 존재 여부를
 *   `in`/descriptor로 검증하므로 `has`/`getOwnPropertyDescriptor` trap이 필요하다.
 */
const isIconName = (prop: string | symbol): prop is string =>
  typeof prop === "string" && /^[A-Z]/.test(prop);

export const lucideProxy = () => {
  const target = { __esModule: true } as Record<string | symbol, unknown>;
  const makeIcon = (name: string) => {
    const Icon = () => createElement("span", { "data-testid": `lucide-${name}` });
    Icon.displayName = name;
    return Icon;
  };

  return new Proxy(target, {
    get: (t, prop) => {
      if (prop in t) return t[prop];
      if (!isIconName(prop)) return undefined;
      return makeIcon(prop);
    },
    has: (t, prop) => prop in t || isIconName(prop),
    getOwnPropertyDescriptor: (t, prop) => {
      if (prop in t) return Reflect.getOwnPropertyDescriptor(t, prop);
      if (!isIconName(prop)) return undefined;
      return { enumerable: true, configurable: true, value: makeIcon(prop) };
    },
  });
};
