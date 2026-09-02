const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const generateToken = (userId, role)=>{
    return jwt.sign({id: userId, role}, process.env.JWT_SECRET,{
        expiresIn: '7d',
    });
};

//signup, login and getMe

module.exports.signup = async(req,res) => {
    try{
        const {name, email, password, role, phone, longitude, latitude}  = req.body;
        if(!name || !email || !phone || !password){
            return res.status(400).json({message: 'missing required fields'});
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }
        const existingUser = await User.findOne({email});
        if (existingUser){
            return res.status(409).json({message: 'email already registered'});
        }
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'citizen',
            phone,
            location: {
                type: 'Point',
                coordinates: [
                    longitude !== undefined ? longitude : 0, 
                    latitude !== undefined ? latitude : 0,
                ],
            },
        });
        const token = generateToken(user._id, user.role);
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({messge: 'Signup-failed', error: err.message});
    }
};

module.exports.login = async(req,res) => {
    try{
        const{email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = generateToken(user._id, user.role);

        res.status(200).json({
            token,
            user: {
            id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch(err){
        res.status(500).json({message: 'Login failed', error: err.message});
    }
};

module.exports.getMe = async(req,res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({user});
};