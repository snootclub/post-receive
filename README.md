# snoot.club/post-receive

a post receive deploy hook for snoots

## usage

put `npx @snootclub/post-receive` in your serve-side repo's `hooks/post-receive`

## snoot usage

for default snoot behaviour you can do something like this inside your snoot container:

```sh
git init --bare /repo
>/repo/hooks/post-receive cat <<.
#!/bin/sh
npx @snootclub/post-receive
.
chmod +x /repo/hooks/post-receive
cd /application
git remote add origin /repo
git add .
git push
```

now you'll be able to do this on your local machine:

```sh
git clone ssh://snoot.club:$MY_PORT/repo snoot
```

and when you push up any changes in `snoot` it will install them,
build them and make them live.

## advanced usage

this isn't really specific to snoots and there are some options avaiable

### --deploymentDirectory

the directory to use as the deployment target, where files are served from
by the webserver.

default `/application`

### --deploymentBranch

the only brank acceptable to deploy from. if changes are pushed to any branch
other than this, they won't be deployed ^_^

default `master`

### --repoDirectory

the source bare repo directory used when deploying. by default this uses the
directory the process is running from, which will be the current repo when
used in a git hook :)

default `process.cwd()`
