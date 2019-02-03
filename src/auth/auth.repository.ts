class AuthRepository {
  async jwt() {
    return await Promise.resolve({ message: 'Login ok' });
  }
}

const repository = new AuthRepository();

export { repository };
