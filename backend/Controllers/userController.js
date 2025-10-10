const User = require("../Models/userSchema");
const connectDB = require('../Database/MongoDb');
const bcrypt = require('bcrypt');
const axios = require("axios");

const getProfile = async (req, res) => {
    connectDB();
    console.log(req.user.id);
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}


const createUser = async(req,res)=>{
    const {
        email,
        password,
        username,
        role
    } = req.body;
    try{
        await connectDB();
        const newUser = new User({
            email:email,
            passwordHash:password,
            username:username,
            role:role
        })
        const saveUser = await newUser.save();
        console.log(saveUser)
    }catch(err){
        console.log(err)
    }
}




const getUser = async(req,res)=>{
    await connectDB();
    try{
        const result = await User.findById(req.params.id)
        res.json(result)
    }catch(err){
            res.json(err)
        }
}


module.exports = {getProfile,createUser,getUser}