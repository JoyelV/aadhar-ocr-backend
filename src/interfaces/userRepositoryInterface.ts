interface UserRepositoryInterface {
  findByEmail(email: string): Promise<any | null>;
  create(email: string, hashedPassword: string): Promise<any>;
}

export default UserRepositoryInterface;