import IndexedDBProvider, { IndexedDBProps } from '@/contexts/IndexedDBProvider'
import {
  Queries,
  RenderHookOptions,
  RenderHookResult,
  queries,
  renderHook,
} from '@testing-library/react'
import { defaultConfig } from './mockIndexedDB'

function customRenderHook<
  Result,
  Props,
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  render: (initialProps: Props) => Result,
  options?: {
    renderHook?: RenderHookOptions<Props, Q, Container, BaseElement>
    wrapper?: Omit<IndexedDBProps, 'children'>
  },
): RenderHookResult<Result, Props> {
  return renderHook(render, {
    wrapper:
      options?.renderHook?.wrapper ??
      (({ children }) => (
        <IndexedDBProvider config={defaultConfig} {...options?.wrapper}>
          {children}
        </IndexedDBProvider>
      )),
    ...options?.renderHook,
  })
}

export { customRenderHook as renderHook }
