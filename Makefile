BUILD_DIR=./build
BUILD_CMD=npx tsc
INDEX=index.html
STYLES=style.css

all:
	$(BUILD_CMD)
	cp $(INDEX) $(BUILD_DIR)
	cp $(STYLES) $(BUILD_DIR)

clean:
	rm -rf $(BUILD_DIR)
