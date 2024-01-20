from setuptools import setup

with open("README.md", "r") as fh:
    Readme = fh.read()

setup(
    name = 'dataFishing',
    version = '0.0.1',
    description = 'dataFishing is a Python class for mining data from the web, including data from NCBI, IUCN, BOLDSystems, and others.',
    long_description = Readme,
    long_description_content_type="text/markdown",
    author = 'Luan Rabelo',
    author_email = 'luanrabelo@outlook.com',
    maintainer = 'Luan Rabelo',
    maintainer_email = 'luanrabelo@outlook.com',
    url='https://github.com/luanrabelo/dataFishing',
    download_url='https://github.com/luanrabelo/dataFishing',
    packages=['dataFishing'],
    license='MIT License',
    keywords='dataFishing Genes Bioinformatics',
    install_requires=['requests', 'pandas', 'openpyxl'],
    classifiers= [
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Science/Research",
        "Environment :: Web Environment",
        "Topic :: Scientific/Engineering :: Bio-Informatics",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.7",
        "Operating System :: Microsoft :: Windows",
        "Operating System :: MacOS :: MacOS X",
        "Operating System :: POSIX :: Linux",
    ],
    )