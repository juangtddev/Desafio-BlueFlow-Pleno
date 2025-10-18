// .pnpmfile.cjs
function readPackage(pkg) {
  if (pkg.name === '@prisma/client' || pkg.name === 'prisma') {
    // Permite que o Prisma execute seus scripts de 'postinstall'
    pkg.requiresBuild = true;
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};