import User from '../models/User.js';
class UserRepository {
    async findByEmail(email) {
        return await User.findOne({ email });
    }
    async create(email, hashedPassword) {
        const user = new User({ email, password: hashedPassword });
        return await user.save();
    }
}
export default UserRepository;
