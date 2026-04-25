const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    savedMeals: [
        {
            savedAt:        { type: Date,   default: Date.now },
            currency:       { type: String  },
            currencySymbol: { type: String  },
            budget:         { type: Number  },
            summary:        { type: Object  },
            meals:          { type: Array   },
        }
    ]
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;