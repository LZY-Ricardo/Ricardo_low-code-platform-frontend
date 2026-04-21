import type { PropsWithChildren, CSSProperties } from "react";

export interface CommonComponentProps extends PropsWithChildren {
  id: number
  name: string
  styles?: CSSProperties
  // 现有物料组件依赖宽松动态属性传递，先保持兼容，后续在组件生态阶段再逐步收紧。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}
