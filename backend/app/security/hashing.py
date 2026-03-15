from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    hashed_password = pwd_context.hash(password)
    return hashed_password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    verified_password = pwd_context.verify(plain_password, hashed_password)
    return verified_password
