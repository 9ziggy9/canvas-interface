BUILD_DIR=./build
BUILD_CMD=npx tsc

all:
	$(BUILD_CMD)

clean:
	rm -rf $(BUILD_DIR)
