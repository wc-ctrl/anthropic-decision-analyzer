export interface FrameworkField {
  id: string
  label: string
  placeholder: string
}

export type FrameworkLayout =
  | 'grid-2x2'
  | 'grid-3x2'
  | 'canvas'
  | 'porter'
  | 'seven-s'
  | 'value-chain'
  | 'five-whys'
  | 'gap'
  | 'three-columns'
  | 'generic'

export interface FrameworkDefinition {
  id: string
  name: string
  description: string
  category: string
  fields: FrameworkField[]
  layout: FrameworkLayout
}

export interface PopulatedFramework {
  frameworkId: string
  frameworkName: string
  caseDescription: string
  fields: Record<string, string>
  recommendation?: string
}
