import { dirname } from "path"
import { fileURLToPath } from "url"

export function __dirname(): string {
  return dirname(fileURLToPath(import.meta.url))
}
