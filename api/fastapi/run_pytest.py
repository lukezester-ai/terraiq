import pytest
import sys

if __name__ == "__main__":
    with open("pytest_output.txt", "w") as f:
        sys.stdout = f
        sys.stderr = f
        pytest.main(["test_agents.py", "-v"])
