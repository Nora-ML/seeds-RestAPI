exports.read = (req, res) => {
    console.log(" Read => return user info to client side")
    req.profile.hashed_password=undefined;
    req.profile.salt=undefined;
    return res.json(req.profile);
}