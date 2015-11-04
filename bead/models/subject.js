module.exports = {
    identity: 'subject',
    connection: 'default',
    attributes: {
        subject_code: {
            type: 'string',
            required: true,
        },
        subject_name: {
            type: 'string',
            required: true,
        },
        teacher: {
            type: 'string',
            required: true,
        },
        credit: {
            type: 'string',
            required: true,
        },
        user: {
            model: 'user'
            
        }
    }
}