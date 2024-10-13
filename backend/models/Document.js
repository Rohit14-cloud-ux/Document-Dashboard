const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    docNumber: String,
    docName: String,
    revision: String,
    dueDate: Date,
    code: String,
    status: {
        type: String,
        enum: ['Pending Submission', 'Awaiting Approval', 'Approved', 'Rejected'],
        default: 'Awaiting Approval'
    },
    category: {
        type: String,
        enum: ['Quality', 'Design', 'Project', 'Others'],
        required: true
    },
    submissionDate: Date,
    receivedDate: Date,
    delay: String,
    customerEmail: {
        type: String,
        default: 'rohitpatil@sparklecleantech.com'
    },
    transmittalNumber: String
});

module.exports = mongoose.model('Document', documentSchema);