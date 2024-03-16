import secrets
import string


def generate_random_string(length):
    # letters, digits, and punctuation으로 구성된 문자열 생성
    characters = string.ascii_letters + string.digits
    # 주어진 길이만큼 랜덤 문자열 생성
    random_string = "".join(secrets.choice(characters) for i in range(length))
    return random_string
