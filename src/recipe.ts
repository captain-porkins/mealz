import _ from "lodash"

type Ingredient = {
  name: string
  quantity?: {
    value: number
    unit?: string
  }
}

export type Recipe = {
  _id: string
  servings: number
  lunch?: boolean
  dinner?: boolean
  ingredients?: Ingredient[]
  method?: string
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

const isValidIngredient = (v: unknown): v is Ingredient => {
  if (isRecord(v)) {
    const nameValid = _.isString(v.name)
    const quanityValid =
      !v.quantity ||
      (isRecord(v.quantity) &&
        _.isNumber(v.quantity.value) &&
        (!v.quantity.unit || _.isString(v.quantity.unit)))
    return nameValid && quanityValid
  } else {
    return false
  }
}

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
  } else if (r.lunch && !(typeof r.lunch === "boolean")) {
    return {
      isValid: false,
      reason: "lunch is defined but is not a boolean",
    }
  } else if (r.dinner && !(typeof r.dinner === "boolean")) {
    return {
      isValid: false,
      reason: "dinner is defined but is not a boolean",
    }
  } else if (
    r.ingredients &&
    !(
      _.isArray(r.ingredients) &&
      r.ingredients.every((i) => isValidIngredient(i))
    )
  ) {
    return {
      isValid: false,
      reason:
        "ingredients defined but has invalid type, should be {name: string, quanity?: {value: number, unit?: string ",
    }
  } else if (r.method && !_.isString(r.method)) {
    return {
      isValid: false,
      reason: "method is defined but is not a string",
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
