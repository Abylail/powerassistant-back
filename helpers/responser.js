
// Создать ошибку
export const createError = (message) => ({
  message: message
})

// Создать ошибку
export const createResponse = (answer) => ({
  body: answer
})

// Создание where (не добавляет пустые в запрос)
export const createWhere = (whereParams = {}) => {
  let result = {};

  Object.keys(whereParams).forEach(key => {
    if (whereParams[key]) result[key] = whereParams[key]
  })

  return result;
}

