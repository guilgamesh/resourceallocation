import inspect

def func_a():
    f = inspect.currentframe()
    print("Hello")

func_a()