const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/generateToken');

async function registerUser(req, res) {

    const { username, email, password } = req.body;

    const isUserExist = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if(isUserExist){
        return res.status(409).json({
            message: "User already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    let token = generateToken(user);
    res.cookie("token", token);

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        }
    })
}

async function loginUser(req, res) {
    const { username, email, password } = req.body;

    const user = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if(!user){
        return res.status(404).json({ message: "Invalid Credentials" });
    }

    const isPaswordValid = await bcrypt.compare(password, user.password);

    if(!isPaswordValid){
        return res.status(404).json({ message: "Invalid Credentials" });
    }

    let token = generateToken(user);
    res.cookie("token", token);

    res.status(200).json({
        message: "User Logged in Successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        }
    });
}

module.exports = { registerUser, loginUser };