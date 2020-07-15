# Single Line Proxy

Command line utility to create a command line proxy.  

## Usage

```
npx single-line-proxy "/api/(.*)>3000" "/(.*)>3001" 4000
```

Will run a proxy on port 4000 and forward requests that match each of the path patterns to the corresponding port on localhost.

Or install it

```
npm install -g single-line-proxy
slp "/api/(.*)>3000" "/(.*)>3001" 4000
```