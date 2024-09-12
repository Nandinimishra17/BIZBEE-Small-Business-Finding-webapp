import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* REGISTER USER */
/* The way this register function will work- we're going to encrypt the password, save it. After we save it, When the user tries to login- we're/they're going to provide the password, we're going to solve/check it if that's the correct one and then we're going to give them a json web token*/

//asynchronous call to mongoDB
export const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName, 
            email, 
            password, 
            picturePath,
            friends,
            location,
            occupation
        } = req.body; //grabbing all of this from the req.body- we're structuring these parameters from the request body. So on the front end we're going to have to send an object that has these arguments, grab these in req.body and use it in this function
        
        
        const salt = await bcrypt.genSalt(); // encrypt password by salt pass
        const passwordHash = await bcrypt.hash(password, salt); //gets the hashed form of the password

        const newUser = new User({
            firstName,
            lastName, 
            email, 
            password: passwordHash, 
            picturePath,
            friends,
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 10000),
            impressions: Math.floor(Math.random() * 10000),
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser); //send the user a status of 201 i.e. something has been created -back to correct status , created a json version  of the saved user so that the front end can recieve this response
    } catch(err){
      res.status(500).json({ error: err.message });
    }
}

/* LOGGING IN */
export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) return res.status(400).json({ msg: "User does not exist. " });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      delete user.password; //Deletes the password field from the user object before sending it back to the client for security reasons.
      res.status(200).json({ token, user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };