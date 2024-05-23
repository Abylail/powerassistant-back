const report = {
    "name": "report",
    "description": "Если пользователь столкнулся с проблемой связанной с бизнесом, можно отправить заявку что бы ее исправили",
    "parameters": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "Имя клиента"
            },
            "phone": {
                "type": "string",
                "description": "Личный номер клиента в формате: +7 ### ### ## ##"
            },
            "error": {
                "type": "string",
                "description": "Описание проблемы с которой столкнулся пользователь"
            }
        },
        "required": [
            "name",
            "phone"
        ]
    }
}

export const list = [
    report,
]

export default {
    report,
}