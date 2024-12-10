import express  from "express"
    import  * as auth  from "./auth.controller.js"
const authRouter =express.Router()



authRouter.post('/signUp',auth.signUp)
authRouter.post('/signIn',auth.signIn)
authRouter.post("/refresh-token", auth.refreshToken);

export default authRouter


