# backend/app/auth/utils.py

from passlib.context import CryptContext

# bcrypt is the hashing algorithm — work factor 12 is the production-grade default
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Return bcrypt hash of a plaintext password."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the stored bcrypt hash."""
    return pwd_context.verify(plain, hashed)
