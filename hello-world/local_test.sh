cd $(dirname $0)
npm init --yes
sam build
sam local start-api &
sleep 5
curl localhost:3000/hello
