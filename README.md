# 
```bash
# 1. Update your system
sudo apt update && sudo apt upgrade -y

# 2. Install curl and required tools
sudo apt install -y curl software-properties-common ca-certificates

# 3. Add NodeSource APT repository for Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 4. Install Node.js (includes npm)
sudo apt-get install -y nodejs

# 5. Verify versions
node -v   # Should print v20.x.x
npm -v    # Should print the matching npm version"
```
```bash
git clone https://github.com/craze-labes/panel && cd panel &&
npm install && npm run seed && npm run createUser && node .
```
# daemon
```bash
git clone https://github.com/craze-labes/daemon && cd Daemon
&& npm install
```
