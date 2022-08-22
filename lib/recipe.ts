import _ from "lodash"

export type Recipe = {
  _id: string
  servings: number
}

export type Valid = {
  isValid: true
}

export type Invalid = {
  isValid: false
  reason: string
}

const isRecord = (u: unknown): u is Record<string, unknown> =>
  _.isObjectLike(u) && !_.isArray(u)

const checkValidity = (r: unknown): Valid | Invalid => {
  if (!isRecord(r)) {
    return {
      isValid: false,
      reason: "Not an object",
    }
  } else if (!_.isString(r._id)) {
    return {
      isValid: false,
      reason: "_id not defined or not a string",
    }
  } else if (!_.isNumber(r.servings)) {
    return {
      isValid: false,
      reason: "servings not defined or not a number",
    }
  } else {
    return { isValid: true }
  }
}

export const isValidRecipe = (r: unknown): r is Recipe => {
  const result = checkValidity(r)
  return result.isValid
}

export const reasonForInvalidity = (r: unknown): string => {
  const result = checkValidity(r)
  if (result.isValid) {
    throw new Error(
      `reasonForInvalidity called on a valid recipe, '${(r as Recipe)._id}'`
    )
  }
  return result.reason
}
