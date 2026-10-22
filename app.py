import sys


def clear():
    print("\033[2J\033[H", end="")


def menu():
    print("==============================")
    print("   Boss Lab Console           ")
    print("==============================")
    print("1. Write something")
    print("2. Delete item")
    print("3. Show all items")
    print("4. Input number")
    print("5. Largest of two numbers")
    print("6. Exit")
    print("==============================")


def read_input(prompt):
    try:
        return input(prompt).strip()
    except (EOFError, KeyboardInterrupt):
        return None


def main():
    items = []
    clear()
    print("Program ready!\n")

    while True:
        menu()
        choice = read_input("Select option: ")
        if choice is None:
            print("\nExit by user.")
            break

        if choice == "1":
            text = read_input("Enter text: ")
            if text is None:
                print("\nCancelled.")
            elif text:
                items.append(text)
                print("Saved!")
            else:
                print("Empty text, nothing saved.")
        elif choice == "2":
            if not items:
                print("No items to delete.")
                continue
            for i, item in enumerate(items, 1):
                print(f"{i}. {item}")
            raw = read_input("Enter number to delete: ")
            if raw is None:
                print("\nCancelled.")
                continue
            try:
                idx = int(raw) - 1
                if 0 <= idx < len(items):
                    removed = items.pop(idx)
                    print(f"Deleted: {removed}")
                else:
                    print("Invalid number.")
            except ValueError:
                print("Please enter a valid number.")
        elif choice == "3":
            if not items:
                print("No items saved yet.")
            else:
                print("Saved items:")
                for i, item in enumerate(items, 1):
                    print(f"{i}. {item}")
        elif choice == "4":
            raw = read_input("Enter number: ")
            if raw is None:
                print("\nCancelled.")
            else:
                try:
                    num = int(raw)
                    items.append(str(num))
                    print(f"Saved number: {num}")
                except ValueError:
                    print("Please enter a valid number.")
        elif choice == "5":
            a = read_input("Enter 1st number: ")
            b = read_input("Enter 2nd number: ")
            if a is None or b is None:
                print("\nCancelled.")
            else:
                try:
                    na, nb = int(a), int(b)
                    print(f"Largest: {na if na >= nb else nb}")
                except ValueError:
                    print("Please enter valid numbers.")
        elif choice == "6":
            print("Goodbye!")
            break
        else:
            print("Invalid option, try again.")

        read_input("\nPress Enter to continue...")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
