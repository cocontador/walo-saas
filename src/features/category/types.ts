export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type CategoryListItem = {
  id: string
  name: string
  isActive: boolean
  visible: boolean
}
