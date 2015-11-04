module.exports = {
    identity: 'subject_list' ,
    connection: 'default',
    unique: true,
    code: {
        type: 'array',
        required: true
    },
    userid: {
        type: 'integer',
        required: true,
        unique:true
    }
}   ;