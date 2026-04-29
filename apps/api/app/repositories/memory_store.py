from copy import deepcopy
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any


DEFAULT_USER_SETTINGS: dict[str, Any] = {
    "defaultLevelMin": 1,
    "defaultLevelMax": 3,
    "defaultTimeLimit": 60,
    "strictMode": False,
    "autoAdvanceAfterAnswer": False,
}


SEED_QUIZZES: list[dict[str, Any]] = [
    # Level 1
    {
        "id": "quiz_1_1",
        "difficultyLevel": 1,
        "promptText": "x squared",
        "targetLatex": "x^2",
        "acceptedVariants": ["x^{2}"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_2",
        "difficultyLevel": 1,
        "promptText": "a over b",
        "targetLatex": "\\frac{a}{b}",
        "acceptedVariants": [],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_3",
        "difficultyLevel": 1,
        "promptText": "square root of x",
        "targetLatex": "\\sqrt{x}",
        "acceptedVariants": [],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_4",
        "difficultyLevel": 1,
        "promptText": "a subscript b",
        "targetLatex": "a_b",
        "acceptedVariants": ["a_{b}"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_5",
        "difficultyLevel": 1,
        "promptText": "x subscript i",
        "targetLatex": "x_i",
        "acceptedVariants": ["x_{i}"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_6",
        "difficultyLevel": 1,
        "promptText": "x cubed",
        "targetLatex": "x^3",
        "acceptedVariants": ["x^{3}"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_7",
        "difficultyLevel": 1,
        "promptText": "alpha",
        "targetLatex": "\\alpha",
        "acceptedVariants": [],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_8",
        "difficultyLevel": 1,
        "promptText": "beta",
        "targetLatex": "\\beta",
        "acceptedVariants": [],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_9",
        "difficultyLevel": 1,
        "promptText": "x plus y",
        "targetLatex": "x + y",
        "acceptedVariants": ["x+y"],
        "timeLimitSec": 30,
    },
    {
        "id": "quiz_1_10",
        "difficultyLevel": 1,
        "promptText": "a times b",
        "targetLatex": "a \\times b",
        "acceptedVariants": ["a\\times b"],
        "timeLimitSec": 30,
    },
    # Level 2
    {
        "id": "quiz_2_1",
        "difficultyLevel": 2,
        "promptText": "sum from i equals 1 to n of i",
        "targetLatex": "\\sum_{i=1}^{n} i",
        "acceptedVariants": ["\\sum_{i = 1}^{n} i"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_2",
        "difficultyLevel": 2,
        "promptText": "integral from 0 to 1 of x squared dx",
        "targetLatex": "\\int_0^1 x^2 dx",
        "acceptedVariants": ["\\int_{0}^{1} x^{2} dx"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_3",
        "difficultyLevel": 2,
        "promptText": "alpha plus beta",
        "targetLatex": "\\alpha + \\beta",
        "acceptedVariants": ["\\alpha+\\beta"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_4",
        "difficultyLevel": 2,
        "promptText": "x approaches infinity",
        "targetLatex": "x \\to \\infty",
        "acceptedVariants": ["x\\to\\infty"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_5",
        "difficultyLevel": 2,
        "promptText": "partial derivative of f with respect to x",
        "targetLatex": "\\frac{\\partial f}{\\partial x}",
        "acceptedVariants": [],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_6",
        "difficultyLevel": 2,
        "promptText": "binomial coefficient n choose k",
        "targetLatex": "\\binom{n}{k}",
        "acceptedVariants": [],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_7",
        "difficultyLevel": 2,
        "promptText": "x less than or equal to y",
        "targetLatex": "x \\le y",
        "acceptedVariants": ["x\\leq y", "x \\leq y"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_8",
        "difficultyLevel": 2,
        "promptText": "x greater than or equal to y",
        "targetLatex": "x \\ge y",
        "acceptedVariants": ["x\\geq y", "x \\geq y"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_9",
        "difficultyLevel": 2,
        "promptText": "absolute value of x",
        "targetLatex": "\\left|x\\right|",
        "acceptedVariants": ["|x|", "\\lvert x \\rvert"],
        "timeLimitSec": 45,
    },
    {
        "id": "quiz_2_10",
        "difficultyLevel": 2,
        "promptText": "e to the x",
        "targetLatex": "e^x",
        "acceptedVariants": ["e^{x}"],
        "timeLimitSec": 45,
    },
    # Level 3
    {
        "id": "quiz_3_1",
        "difficultyLevel": 3,
        "promptText": "limit as x approaches 0 of sin x over x",
        "targetLatex": "\\lim_{x \\to 0} \\frac{\\sin x}{x}",
        "acceptedVariants": ["\\lim_{x\\to0}\\frac{\\sin x}{x}"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_2",
        "difficultyLevel": 3,
        "promptText": "2 by 2 matrix with 1 2 3 4",
        "targetLatex": "\\begin{bmatrix}1 & 2 \\\\ 3 & 4\\end{bmatrix}",
        "acceptedVariants": [],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_3",
        "difficultyLevel": 3,
        "promptText": "quadratic formula",
        "targetLatex": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        "acceptedVariants": ["x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_4",
        "difficultyLevel": 3,
        "promptText": "gradient of f",
        "targetLatex": "\\nabla f",
        "acceptedVariants": [],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_5",
        "difficultyLevel": 3,
        "promptText": "dot product of vectors a and b",
        "targetLatex": "\\vec{a} \\cdot \\vec{b}",
        "acceptedVariants": ["\\mathbf{a} \\cdot \\mathbf{b}"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_6",
        "difficultyLevel": 3,
        "promptText": "probability of A given B",
        "targetLatex": "P(A \\mid B)",
        "acceptedVariants": ["P(A|B)"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_7",
        "difficultyLevel": 3,
        "promptText": "expected value of X",
        "targetLatex": "\\mathbb{E}[X]",
        "acceptedVariants": ["E[X]"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_8",
        "difficultyLevel": 3,
        "promptText": "variance of X",
        "targetLatex": "\\operatorname{Var}(X)",
        "acceptedVariants": ["Var(X)", "\\mathrm{Var}(X)"],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_9",
        "difficultyLevel": 3,
        "promptText": "set of real numbers",
        "targetLatex": "\\mathbb{R}",
        "acceptedVariants": [],
        "timeLimitSec": 60,
    },
    {
        "id": "quiz_3_10",
        "difficultyLevel": 3,
        "promptText": "product from i equals 1 to n of x_i",
        "targetLatex": "\\prod_{i=1}^{n} x_i",
        "acceptedVariants": ["\\prod_{i=1}^{n} x_{i}"],
        "timeLimitSec": 60,
    },
        # Level 4
    {
        "id": "quiz_4_1",
        "difficultyLevel": 4,
        "promptText": "derivative of sin x equals cos x",
        "targetLatex": "\\frac{d}{dx}\\sin x = \\cos x",
        "acceptedVariants": ["\\frac{d}{dx} \\sin x = \\cos x"],
        "timeLimitSec": 75,
    },
    {
        "id": "quiz_4_2",
        "difficultyLevel": 4,
        "promptText": "second derivative of f with respect to x",
        "targetLatex": "\\frac{d^2 f}{dx^2}",
        "acceptedVariants": ["\\frac{d^{2}f}{dx^{2}}"],
        "timeLimitSec": 75,
    },
    {
        "id": "quiz_4_3",
        "difficultyLevel": 4,
        "promptText": "integral of e to the x dx equals e to the x plus C",
        "targetLatex": "\\int e^x\\,dx = e^x + C",
        "acceptedVariants": ["\\int e^{x}\\,dx = e^{x} + C"],
        "timeLimitSec": 75,
    },
    {
        "id": "quiz_4_4",
        "difficultyLevel": 4,
        "promptText": "Taylor expansion of e to the x",
        "targetLatex": "e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}",
        "acceptedVariants": ["e^{x}=\\sum_{n=0}^{\\infty}\\frac{x^{n}}{n!}"],
        "timeLimitSec": 75,
    },
    {
        "id": "quiz_4_5",
        "difficultyLevel": 4,
        "promptText": "piecewise function x squared if x greater than 0 otherwise 0",
        "targetLatex": "f(x)=\\begin{cases}x^2,&x>0\\\\0,&x\\le 0\\end{cases}",
        "acceptedVariants": [
            "f(x)=\\begin{cases}x^{2},&x>0\\\\0,&x\\leq 0\\end{cases}"
        ],
        "timeLimitSec": 75,
    },
    {
        "id": "quiz_4_6",
        "difficultyLevel": 4,
        "promptText": "norm of vector x",
        "targetLatex": "\\lVert x \\rVert_2",
        "acceptedVariants": ["\\|x\\|_2", "\\left\\|x\\right\\|_2"],
        "timeLimitSec": 75,
    },
    {
        "id": "quiz_4_7",
        "difficultyLevel": 4,
        "promptText": "inner product of x and y",
        "targetLatex": "\\langle x, y \\rangle",
        "acceptedVariants": ["\\left\\langle x,y\\right\\rangle"],
        "timeLimitSec": 75,
    },
    {
        "id": "quiz_4_8",
        "difficultyLevel": 4,
        "promptText": "arg max over theta of L theta",
        "targetLatex": "\\arg\\max_{\\theta} L(\\theta)",
        "acceptedVariants": ["\\operatorname*{arg\\,max}_{\\theta}L(\\theta)"],
        "timeLimitSec": 75,
    },
    {
        "id": "quiz_4_9",
        "difficultyLevel": 4,
        "promptText": "indicator function of x greater than zero",
        "targetLatex": "\\mathbf{1}_{\\{x>0\\}}",
        "acceptedVariants": ["\\mathbb{1}_{\\{x>0\\}}"],
        "timeLimitSec": 75,
    },
    {
        "id": "quiz_4_10",
        "difficultyLevel": 4,
        "promptText": "log likelihood sum from i equals 1 to n log p of x i theta",
        "targetLatex": "\\ell(\\theta)=\\sum_{i=1}^{n}\\log p(x_i\\mid\\theta)",
        "acceptedVariants": [
            "\\ell(\\theta)=\\sum_{i=1}^{n}\\log p(x_{i}\\mid\\theta)"
        ],
        "timeLimitSec": 75,
    },

    # Level 5
    {
        "id": "quiz_5_1",
        "difficultyLevel": 5,
        "promptText": "Bayes theorem",
        "targetLatex": "P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}",
        "acceptedVariants": ["P(A|B)=\\frac{P(B|A)P(A)}{P(B)}"],
        "timeLimitSec": 90,
    },
    {
        "id": "quiz_5_2",
        "difficultyLevel": 5,
        "promptText": "variance equals expected x squared minus expected x squared",
        "targetLatex": "\\operatorname{Var}(X)=\\mathbb{E}[X^2]-\\mathbb{E}[X]^2",
        "acceptedVariants": ["Var(X)=E[X^2]-E[X]^2"],
        "timeLimitSec": 90,
    },
    {
        "id": "quiz_5_3",
        "difficultyLevel": 5,
        "promptText": "covariance of X and Y",
        "targetLatex": "\\operatorname{Cov}(X,Y)=\\mathbb{E}[(X-\\mu_X)(Y-\\mu_Y)]",
        "acceptedVariants": ["Cov(X,Y)=E[(X-\\mu_X)(Y-\\mu_Y)]"],
        "timeLimitSec": 90,
    },
    {
        "id": "quiz_5_4",
        "difficultyLevel": 5,
        "promptText": "normal distribution density",
        "targetLatex": "f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}",
        "acceptedVariants": [
            "f(x)=\\frac{1}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}"
        ],
        "timeLimitSec": 90,
    },
    {
        "id": "quiz_5_5",
        "difficultyLevel": 5,
        "promptText": "softmax function",
        "targetLatex": "\\operatorname{softmax}(z_i)=\\frac{e^{z_i}}{\\sum_{j=1}^{K}e^{z_j}}",
        "acceptedVariants": [
            "\\mathrm{softmax}(z_i)=\\frac{e^{z_i}}{\\sum_{j=1}^{K}e^{z_j}}"
        ],
        "timeLimitSec": 90,
    },
    {
        "id": "quiz_5_6",
        "difficultyLevel": 5,
        "promptText": "cross entropy loss",
        "targetLatex": "\\mathcal{L}=-\\sum_{i=1}^{K}y_i\\log \\hat{y}_i",
        "acceptedVariants": [
            "L=-\\sum_{i=1}^{K}y_i\\log \\hat{y}_i"
        ],
        "timeLimitSec": 90,
    },
    {
        "id": "quiz_5_7",
        "difficultyLevel": 5,
        "promptText": "matrix transpose product x transpose x",
        "targetLatex": "x^{\\top}x",
        "acceptedVariants": ["x^Tx", "x^{T}x"],
        "timeLimitSec": 90,
    },
    {
        "id": "quiz_5_8",
        "difficultyLevel": 5,
        "promptText": "determinant of 2 by 2 matrix",
        "targetLatex": "\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=ad-bc",
        "acceptedVariants": [
            "\\det\\left(\\begin{matrix}a&b\\\\c&d\\end{matrix}\\right)=ad-bc"
        ],
        "timeLimitSec": 90,
    },
    {
        "id": "quiz_5_9",
        "difficultyLevel": 5,
        "promptText": "eigenvalue equation",
        "targetLatex": "A\\mathbf{v}=\\lambda\\mathbf{v}",
        "acceptedVariants": ["Av=\\lambda v"],
        "timeLimitSec": 90,
    },
    {
        "id": "quiz_5_10",
        "difficultyLevel": 5,
        "promptText": "trace of matrix A",
        "targetLatex": "\\operatorname{tr}(A)=\\sum_{i=1}^{n}a_{ii}",
        "acceptedVariants": ["\\mathrm{tr}(A)=\\sum_{i=1}^{n}a_{ii}"],
        "timeLimitSec": 90,
    },

    # Level 6
    {
        "id": "quiz_6_1",
        "difficultyLevel": 6,
        "promptText": "gradient descent update rule",
        "targetLatex": "\\theta_{t+1}=\\theta_t-\\eta\\nabla_{\\theta}\\mathcal{L}(\\theta_t)",
        "acceptedVariants": [
            "\\theta_{t+1}=\\theta_t-\\eta\\nabla\\mathcal{L}(\\theta_t)"
        ],
        "timeLimitSec": 105,
    },
    {
        "id": "quiz_6_2",
        "difficultyLevel": 6,
        "promptText": "ordinary least squares estimator",
        "targetLatex": "\\hat{\\beta}=(X^{\\top}X)^{-1}X^{\\top}y",
        "acceptedVariants": ["\\hat\\beta=(X^TX)^{-1}X^Ty"],
        "timeLimitSec": 105,
    },
    {
        "id": "quiz_6_3",
        "difficultyLevel": 6,
        "promptText": "ridge regression estimator",
        "targetLatex": "\\hat{\\beta}_{\\lambda}=(X^{\\top}X+\\lambda I)^{-1}X^{\\top}y",
        "acceptedVariants": ["\\hat\\beta_\\lambda=(X^TX+\\lambda I)^{-1}X^Ty"],
        "timeLimitSec": 105,
    },
    {
        "id": "quiz_6_4",
        "difficultyLevel": 6,
        "promptText": "sigmoid function",
        "targetLatex": "\\sigma(x)=\\frac{1}{1+e^{-x}}",
        "acceptedVariants": [],
        "timeLimitSec": 105,
    },
    {
        "id": "quiz_6_5",
        "difficultyLevel": 6,
        "promptText": "binary cross entropy",
        "targetLatex": "\\mathcal{L}=-(y\\log p+(1-y)\\log(1-p))",
        "acceptedVariants": ["L=-(y\\log p+(1-y)\\log(1-p))"],
        "timeLimitSec": 105,
    },
    {
        "id": "quiz_6_6",
        "difficultyLevel": 6,
        "promptText": "KL divergence discrete",
        "targetLatex": "D_{\\mathrm{KL}}(P\\Vert Q)=\\sum_x P(x)\\log\\frac{P(x)}{Q(x)}",
        "acceptedVariants": [
            "D_{KL}(P\\|Q)=\\sum_x P(x)\\log\\frac{P(x)}{Q(x)}"
        ],
        "timeLimitSec": 105,
    },
    {
        "id": "quiz_6_7",
        "difficultyLevel": 6,
        "promptText": "entropy of discrete distribution",
        "targetLatex": "H(X)=-\\sum_x p(x)\\log p(x)",
        "acceptedVariants": [],
        "timeLimitSec": 105,
    },
    {
        "id": "quiz_6_8",
        "difficultyLevel": 6,
        "promptText": "law of total probability",
        "targetLatex": "P(A)=\\sum_i P(A\\mid B_i)P(B_i)",
        "acceptedVariants": ["P(A)=\\sum_i P(A|B_i)P(B_i)"],
        "timeLimitSec": 105,
    },
    {
        "id": "quiz_6_9",
        "difficultyLevel": 6,
        "promptText": "central limit theorem normalized sum",
        "targetLatex": "\\frac{\\bar{X}_n-\\mu}{\\sigma/\\sqrt{n}}\\xrightarrow{d}N(0,1)",
        "acceptedVariants": [
            "\\frac{\\bar X_n-\\mu}{\\sigma/\\sqrt n}\\to N(0,1)"
        ],
        "timeLimitSec": 105,
    },
    {
        "id": "quiz_6_10",
        "difficultyLevel": 6,
        "promptText": "Jacobian matrix partial derivatives",
        "targetLatex": "J_{ij}=\\frac{\\partial f_i}{\\partial x_j}",
        "acceptedVariants": [],
        "timeLimitSec": 105,
    },

    # Level 7
    {
        "id": "quiz_7_1",
        "difficultyLevel": 7,
        "promptText": "Black Scholes call option price",
        "targetLatex": "C=S_0N(d_1)-Ke^{-rT}N(d_2)",
        "acceptedVariants": [],
        "timeLimitSec": 120,
    },
    {
        "id": "quiz_7_2",
        "difficultyLevel": 7,
        "promptText": "Black Scholes d one",
        "targetLatex": "d_1=\\frac{\\ln(S_0/K)+(r+\\sigma^2/2)T}{\\sigma\\sqrt{T}}",
        "acceptedVariants": [
            "d_1=\\frac{\\log(S_0/K)+(r+\\frac{1}{2}\\sigma^2)T}{\\sigma\\sqrt{T}}"
        ],
        "timeLimitSec": 120,
    },
    {
        "id": "quiz_7_3",
        "difficultyLevel": 7,
        "promptText": "Black Scholes d two",
        "targetLatex": "d_2=d_1-\\sigma\\sqrt{T}",
        "acceptedVariants": [],
        "timeLimitSec": 120,
    },
    {
        "id": "quiz_7_4",
        "difficultyLevel": 7,
        "promptText": "Ito process",
        "targetLatex": "dX_t=\\mu(t,X_t)\\,dt+\\sigma(t,X_t)\\,dW_t",
        "acceptedVariants": [],
        "timeLimitSec": 120,
    },
    {
        "id": "quiz_7_5",
        "difficultyLevel": 7,
        "promptText": "geometric Brownian motion",
        "targetLatex": "dS_t=\\mu S_t\\,dt+\\sigma S_t\\,dW_t",
        "acceptedVariants": [],
        "timeLimitSec": 120,
    },
    {
        "id": "quiz_7_6",
        "difficultyLevel": 7,
        "promptText": "Sharpe ratio",
        "targetLatex": "\\operatorname{SR}=\\frac{\\mathbb{E}[R_p-R_f]}{\\sigma_p}",
        "acceptedVariants": ["SR=\\frac{E[R_p-R_f]}{\\sigma_p}"],
        "timeLimitSec": 120,
    },
    {
        "id": "quiz_7_7",
        "difficultyLevel": 7,
        "promptText": "portfolio variance",
        "targetLatex": "\\sigma_p^2=w^{\\top}\\Sigma w",
        "acceptedVariants": ["\\sigma_p^2=w^T\\Sigma w"],
        "timeLimitSec": 120,
    },
    {
        "id": "quiz_7_8",
        "difficultyLevel": 7,
        "promptText": "mean variance optimization objective",
        "targetLatex": "\\max_w\\; w^{\\top}\\mu-\\frac{\\gamma}{2}w^{\\top}\\Sigma w",
        "acceptedVariants": [
            "\\max_w w^T\\mu-\\frac{\\gamma}{2}w^T\\Sigma w"
        ],
        "timeLimitSec": 120,
    },
    {
        "id": "quiz_7_9",
        "difficultyLevel": 7,
        "promptText": "value at risk definition",
        "targetLatex": "\\operatorname{VaR}_{\\alpha}(L)=\\inf\\{\\ell:P(L\\le \\ell)\\ge \\alpha\\}",
        "acceptedVariants": [
            "VaR_\\alpha(L)=\\inf\\{\\ell:P(L\\le\\ell)\\ge\\alpha\\}"
        ],
        "timeLimitSec": 120,
    },
    {
        "id": "quiz_7_10",
        "difficultyLevel": 7,
        "promptText": "expected shortfall definition",
        "targetLatex": "\\operatorname{ES}_{\\alpha}(L)=\\mathbb{E}[L\\mid L\\ge \\operatorname{VaR}_{\\alpha}(L)]",
        "acceptedVariants": [
            "ES_\\alpha(L)=E[L\\mid L\\ge VaR_\\alpha(L)]"
        ],
        "timeLimitSec": 120,
    },

    # Level 8
    {
        "id": "quiz_8_1",
        "difficultyLevel": 8,
        "promptText": "Ito lemma",
        "targetLatex": "df=\\left(\\frac{\\partial f}{\\partial t}+\\mu\\frac{\\partial f}{\\partial x}+\\frac{1}{2}\\sigma^2\\frac{\\partial^2 f}{\\partial x^2}\\right)dt+\\sigma\\frac{\\partial f}{\\partial x}dW_t",
        "acceptedVariants": [],
        "timeLimitSec": 135,
    },
    {
        "id": "quiz_8_2",
        "difficultyLevel": 8,
        "promptText": "Black Scholes PDE",
        "targetLatex": "\\frac{\\partial V}{\\partial t}+\\frac{1}{2}\\sigma^2S^2\\frac{\\partial^2V}{\\partial S^2}+rS\\frac{\\partial V}{\\partial S}-rV=0",
        "acceptedVariants": [],
        "timeLimitSec": 135,
    },
    {
        "id": "quiz_8_3",
        "difficultyLevel": 8,
        "promptText": "Fokker Planck equation",
        "targetLatex": "\\frac{\\partial p}{\\partial t}=-\\frac{\\partial}{\\partial x}[\\mu(x,t)p]+\\frac{1}{2}\\frac{\\partial^2}{\\partial x^2}[\\sigma^2(x,t)p]",
        "acceptedVariants": [],
        "timeLimitSec": 135,
    },
    {
        "id": "quiz_8_4",
        "difficultyLevel": 8,
        "promptText": "Hamiltonian Monte Carlo Hamiltonian",
        "targetLatex": "H(q,p)=U(q)+K(p)",
        "acceptedVariants": [],
        "timeLimitSec": 135,
    },
    {
        "id": "quiz_8_5",
        "difficultyLevel": 8,
        "promptText": "ELBO objective",
        "targetLatex": "\\mathcal{L}(q)=\\mathbb{E}_q[\\log p(x,z)]-\\mathbb{E}_q[\\log q(z)]",
        "acceptedVariants": [
            "ELBO=E_q[\\log p(x,z)]-E_q[\\log q(z)]"
        ],
        "timeLimitSec": 135,
    },
    {
        "id": "quiz_8_6",
        "difficultyLevel": 8,
        "promptText": "attention mechanism",
        "targetLatex": "\\operatorname{Attention}(Q,K,V)=\\operatorname{softmax}\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V",
        "acceptedVariants": [
            "\\mathrm{Attention}(Q,K,V)=\\mathrm{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V"
        ],
        "timeLimitSec": 135,
    },
    {
        "id": "quiz_8_7",
        "difficultyLevel": 8,
        "promptText": "multi head attention concat",
        "targetLatex": "\\operatorname{MultiHead}(Q,K,V)=\\operatorname{Concat}(h_1,\\dots,h_m)W^O",
        "acceptedVariants": [],
        "timeLimitSec": 135,
    },
    {
        "id": "quiz_8_8",
        "difficultyLevel": 8,
        "promptText": "Gaussian process posterior mean",
        "targetLatex": "\\mu_* = k_*^{\\top}(K+\\sigma_n^2I)^{-1}y",
        "acceptedVariants": [
            "\\mu_*=k_*^T(K+\\sigma_n^2I)^{-1}y"
        ],
        "timeLimitSec": 135,
    },
    {
        "id": "quiz_8_9",
        "difficultyLevel": 8,
        "promptText": "Gaussian process posterior variance",
        "targetLatex": "\\sigma_*^2=k(x_*,x_*)-k_*^{\\top}(K+\\sigma_n^2I)^{-1}k_*",
        "acceptedVariants": [
            "\\sigma_*^2=k(x_*,x_*)-k_*^T(K+\\sigma_n^2I)^{-1}k_*"
        ],
        "timeLimitSec": 135,
    },
    {
        "id": "quiz_8_10",
        "difficultyLevel": 8,
        "promptText": "Lagrangian with equality constraint",
        "targetLatex": "\\mathcal{L}(x,\\lambda)=f(x)+\\lambda^{\\top}g(x)",
        "acceptedVariants": ["L(x,\\lambda)=f(x)+\\lambda^Tg(x)"],
        "timeLimitSec": 135,
    },

    # Level 9
    {
        "id": "quiz_9_1",
        "difficultyLevel": 9,
        "promptText": "Karush Kuhn Tucker stationarity",
        "targetLatex": "\\nabla f(x^*)+\\sum_{i=1}^{m}\\lambda_i\\nabla g_i(x^*)+\\sum_{j=1}^{p}\\nu_j\\nabla h_j(x^*)=0",
        "acceptedVariants": [],
        "timeLimitSec": 150,
    },
    {
        "id": "quiz_9_2",
        "difficultyLevel": 9,
        "promptText": "KKT complementary slackness",
        "targetLatex": "\\lambda_i g_i(x^*)=0,\\quad i=1,\\dots,m",
        "acceptedVariants": ["\\lambda_i g_i(x^*)=0"],
        "timeLimitSec": 150,
    },
    {
        "id": "quiz_9_3",
        "difficultyLevel": 9,
        "promptText": "maximum likelihood estimator arg max",
        "targetLatex": "\\hat{\\theta}_{\\mathrm{MLE}}=\\arg\\max_{\\theta}\\prod_{i=1}^{n}p(x_i\\mid\\theta)",
        "acceptedVariants": [
            "\\hat\\theta_{MLE}=\\arg\\max_\\theta\\prod_{i=1}^{n}p(x_i\\mid\\theta)"
        ],
        "timeLimitSec": 150,
    },
    {
        "id": "quiz_9_4",
        "difficultyLevel": 9,
        "promptText": "MAP estimator arg max",
        "targetLatex": "\\hat{\\theta}_{\\mathrm{MAP}}=\\arg\\max_{\\theta}\\left[\\log p(D\\mid\\theta)+\\log p(\\theta)\\right]",
        "acceptedVariants": [
            "\\hat\\theta_{MAP}=\\arg\\max_\\theta[\\log p(D|\\theta)+\\log p(\\theta)]"
        ],
        "timeLimitSec": 150,
    },
    {
        "id": "quiz_9_5",
        "difficultyLevel": 9,
        "promptText": "stochastic gradient Langevin dynamics",
        "targetLatex": "\\theta_{t+1}=\\theta_t+\\frac{\\epsilon_t}{2}\\nabla_{\\theta}\\log p(\\theta_t\\mid X)+\\eta_t",
        "acceptedVariants": [],
        "timeLimitSec": 150,
    },
    {
        "id": "quiz_9_6",
        "difficultyLevel": 9,
        "promptText": "Euler Maruyama discretization",
        "targetLatex": "X_{t+\\Delta t}=X_t+\\mu(X_t,t)\\Delta t+\\sigma(X_t,t)\\sqrt{\\Delta t}\\,Z_t",
        "acceptedVariants": [],
        "timeLimitSec": 150,
    },
    {
        "id": "quiz_9_7",
        "difficultyLevel": 9,
        "promptText": "Heston variance process",
        "targetLatex": "dv_t=\\kappa(\\theta-v_t)dt+\\xi\\sqrt{v_t}\\,dW_t^v",
        "acceptedVariants": [],
        "timeLimitSec": 150,
    },
    {
        "id": "quiz_9_8",
        "difficultyLevel": 9,
        "promptText": "GARCH one one variance",
        "targetLatex": "\\sigma_t^2=\\omega+\\alpha\\epsilon_{t-1}^2+\\beta\\sigma_{t-1}^2",
        "acceptedVariants": [],
        "timeLimitSec": 150,
    },
    {
        "id": "quiz_9_9",
        "difficultyLevel": 9,
        "promptText": "Kalman filter prediction step covariance",
        "targetLatex": "P_{t\\mid t-1}=FP_{t-1\\mid t-1}F^{\\top}+Q",
        "acceptedVariants": ["P_{t|t-1}=FP_{t-1|t-1}F^T+Q"],
        "timeLimitSec": 150,
    },
    {
        "id": "quiz_9_10",
        "difficultyLevel": 9,
        "promptText": "Kalman gain",
        "targetLatex": "K_t=P_{t\\mid t-1}H^{\\top}(HP_{t\\mid t-1}H^{\\top}+R)^{-1}",
        "acceptedVariants": ["K_t=P_{t|t-1}H^T(HP_{t|t-1}H^T+R)^{-1}"],
        "timeLimitSec": 150,
    },

    # Level 10
    {
        "id": "quiz_10_1",
        "difficultyLevel": 10,
        "promptText": "stochastic optimal control HJB equation",
        "targetLatex": "0=\\frac{\\partial V}{\\partial t}+\\min_u\\left\\{\\mathcal{L}^u V+c(x,u,t)\\right\\}",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
    {
        "id": "quiz_10_2",
        "difficultyLevel": 10,
        "promptText": "Hamilton Jacobi Bellman expanded diffusion",
        "targetLatex": "0=V_t+\\min_u\\left\\{c+\\nabla V^{\\top}b+\\frac{1}{2}\\operatorname{tr}(\\sigma\\sigma^{\\top}\\nabla^2V)\\right\\}",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
    {
        "id": "quiz_10_3",
        "difficultyLevel": 10,
        "promptText": "Bellman optimality equation",
        "targetLatex": "V^*(s)=\\max_a\\sum_{s'}P(s'\\mid s,a)\\left[r(s,a,s')+\\gamma V^*(s')\\right]",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
    {
        "id": "quiz_10_4",
        "difficultyLevel": 10,
        "promptText": "Q learning update",
        "targetLatex": "Q_{t+1}(s,a)=Q_t(s,a)+\\alpha\\left[r+\\gamma\\max_{a'}Q_t(s',a')-Q_t(s,a)\\right]",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
    {
        "id": "quiz_10_5",
        "difficultyLevel": 10,
        "promptText": "policy gradient theorem",
        "targetLatex": "\\nabla_{\\theta}J(\\theta)=\\mathbb{E}_{\\pi_{\\theta}}\\left[\\nabla_{\\theta}\\log\\pi_{\\theta}(a\\mid s)Q^{\\pi}(s,a)\\right]",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
    {
        "id": "quiz_10_6",
        "difficultyLevel": 10,
        "promptText": "evidence lower bound with KL divergence",
        "targetLatex": "\\log p(x)\\ge \\mathbb{E}_{q(z)}[\\log p(x\\mid z)]-D_{\\mathrm{KL}}(q(z)\\Vert p(z))",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
    {
        "id": "quiz_10_7",
        "difficultyLevel": 10,
        "promptText": "reparameterization trick",
        "targetLatex": "z=\\mu_{\\phi}(x)+\\sigma_{\\phi}(x)\\odot\\epsilon,\\quad \\epsilon\\sim\\mathcal{N}(0,I)",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
    {
        "id": "quiz_10_8",
        "difficultyLevel": 10,
        "promptText": "Wasserstein GAN objective",
        "targetLatex": "\\min_G\\max_{D\\in\\mathcal{D}}\\mathbb{E}_{x\\sim P_r}[D(x)]-\\mathbb{E}_{\\tilde{x}\\sim P_G}[D(\\tilde{x})]",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
    {
        "id": "quiz_10_9",
        "difficultyLevel": 10,
        "promptText": "Neural SDE",
        "targetLatex": "dX_t=f_{\\theta}(X_t,t)\\,dt+g_{\\theta}(X_t,t)\\,dW_t",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
    {
        "id": "quiz_10_10",
        "difficultyLevel": 10,
        "promptText": "rough volatility fractional Brownian covariance",
        "targetLatex": "\\mathbb{E}[W_t^H W_s^H]=\\frac{1}{2}\\left(t^{2H}+s^{2H}-|t-s|^{2H}\\right)",
        "acceptedVariants": [],
        "timeLimitSec": 180,
    },
]

def utc_now_iso() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")

def get_quiz_sort_key(quiz: dict[str, Any]) -> tuple[int, int | str]:
    quiz_id = quiz["id"]
    suffix = quiz_id.rsplit("_", 1)[-1]

    if suffix.isdigit():
        return quiz["difficultyLevel"], int(suffix)

    return quiz["difficultyLevel"], quiz_id

@dataclass
class MemoryStore:
    users: dict[str, dict[str, str]] = field(default_factory=dict)
    settings_by_user_id: dict[str, dict[str, Any]] = field(default_factory=dict)
    quizzes: dict[str, dict[str, Any]] = field(
        default_factory=lambda: {quiz["id"]: deepcopy(quiz) for quiz in SEED_QUIZZES}
    )
    quiz_sessions: dict[str, dict[str, Any]] = field(default_factory=dict)
    reveal_state_by_session_id: dict[str, set[str]] = field(default_factory=dict)
    user_id_sequence: int = 1
    quiz_id_sequence: int = 1
    session_id_sequence: int = 1

    def create_user(self, email: str, display_name: str, password: str) -> dict[str, str]:
        existing_user = self.get_user_by_email(email)
        if existing_user is not None:
            raise ValueError("Email already exists.")

        user_id = f"user_{self.user_id_sequence}"
        self.user_id_sequence += 1

        user = {
            "id": user_id,
            "email": email,
            "displayName": display_name,
            "password": password,
        }

        self.users[user_id] = user
        self.settings_by_user_id[user_id] = deepcopy(DEFAULT_USER_SETTINGS)

        return deepcopy(user)

    def get_user_by_email(self, email: str) -> dict[str, str] | None:
        normalized_email = email.lower()

        for user in self.users.values():
            if user["email"].lower() == normalized_email:
                return deepcopy(user)

        return None

    def get_user_by_id(self, user_id: str) -> dict[str, str] | None:
        user = self.users.get(user_id)

        if user is None:
            return None

        return deepcopy(user)

    def get_settings_by_user_id(self, user_id: str) -> dict[str, Any]:
        if user_id not in self.settings_by_user_id:
            self.settings_by_user_id[user_id] = deepcopy(DEFAULT_USER_SETTINGS)

        return deepcopy(self.settings_by_user_id[user_id])

    def update_settings_by_user_id(
        self,
        user_id: str,
        patch: dict[str, Any],
    ) -> dict[str, Any]:
        current_settings = self.get_settings_by_user_id(user_id)
        next_settings = {
            **current_settings,
            **{key: value for key, value in patch.items() if value is not None},
        }

        default_level_min = next_settings["defaultLevelMin"]
        default_level_max = next_settings["defaultLevelMax"]

        if default_level_min > default_level_max:
            raise ValueError(
                "defaultLevelMin must be less than or equal to defaultLevelMax."
            )

        self.settings_by_user_id[user_id] = next_settings

        return deepcopy(next_settings)

    def list_quizzes(self, difficulty_level: int | None = None) -> list[dict[str, Any]]:
        quizzes = list(self.quizzes.values())

        if difficulty_level is not None:
            quizzes = [
                quiz
                for quiz in quizzes
                if quiz["difficultyLevel"] == difficulty_level
            ]

        return [
            deepcopy(quiz)
            for quiz in sorted(
                quizzes,
                key=get_quiz_sort_key,
            )
        ]

    def get_quiz_by_id(self, quiz_id: str) -> dict[str, Any] | None:
        quiz = self.quizzes.get(quiz_id)

        if quiz is None:
            return None

        return deepcopy(quiz)

    def create_quiz(self, payload: dict[str, Any]) -> dict[str, Any]:
        difficulty_level = payload["difficultyLevel"]

        while True:
            quiz_id = f"quiz_custom_{self.quiz_id_sequence}"
            self.quiz_id_sequence += 1

            if quiz_id not in self.quizzes:
                break

        quiz = {
            "id": quiz_id,
            "difficultyLevel": difficulty_level,
            "promptText": payload["promptText"],
            "targetLatex": payload["targetLatex"],
            "acceptedVariants": payload.get("acceptedVariants", []),
            "timeLimitSec": payload["timeLimitSec"],
        }

        self.quizzes[quiz_id] = quiz

        return deepcopy(quiz)

    def update_quiz(self, quiz_id: str, patch: dict[str, Any]) -> dict[str, Any] | None:
        current_quiz = self.quizzes.get(quiz_id)

        if current_quiz is None:
            return None

        next_quiz = {
            **current_quiz,
            **{key: value for key, value in patch.items() if value is not None},
        }

        self.quizzes[quiz_id] = next_quiz

        return deepcopy(next_quiz)

    def delete_quiz(self, quiz_id: str) -> bool:
        if quiz_id not in self.quizzes:
            return False

        del self.quizzes[quiz_id]
        return True

    def create_quiz_session(
        self,
        user_id: str,
        level_min: int,
        level_max: int,
        time_limit_sec_override: int | None = None,
    ) -> dict[str, Any]:
        selected_quizzes: list[dict[str, Any]] = []

        for difficulty_level in range(level_min, level_max + 1):
            level_quizzes = self.list_quizzes(difficulty_level=difficulty_level)

            if len(level_quizzes) < 10:
                raise ValueError("Not enough quizzes for selected level range.")

            selected_level_quizzes = level_quizzes[:10]

            if time_limit_sec_override is not None:
                selected_level_quizzes = [
                    {
                        **quiz,
                        "timeLimitSec": time_limit_sec_override,
                    }
                    for quiz in selected_level_quizzes
                ]

            selected_quizzes.extend(selected_level_quizzes)

        session_id = f"session_{self.session_id_sequence}"
        self.session_id_sequence += 1

        started_at = utc_now_iso()

        session = {
            "id": session_id,
            "userId": user_id,
            "levelMin": level_min,
            "levelMax": level_max,
            "quizzes": selected_quizzes,
            "currentIndex": 0,
            "answers": [],
            "status": "playing",
            "startedAt": started_at,
            "currentQuestionStartedAt": started_at,
            "completedAt": None,
        }

        self.quiz_sessions[session_id] = session
        self.reveal_state_by_session_id[session_id] = set()

        return deepcopy(session)

    def get_quiz_session_by_id(self, session_id: str) -> dict[str, Any] | None:
        session = self.quiz_sessions.get(session_id)

        if session is None:
            return None

        return deepcopy(session)

    def get_owned_quiz_session(
        self,
        session_id: str,
        user_id: str,
    ) -> dict[str, Any] | None:
        session = self.quiz_sessions.get(session_id)

        if session is None or session["userId"] != user_id:
            return None

        return deepcopy(session)

    def mark_current_quiz_revealed(
        self,
        session_id: str,
        quiz_id: str,
    ) -> dict[str, Any] | None:
        session = self.quiz_sessions.get(session_id)

        if session is None:
            return None

        current_quiz = self.get_current_quiz(session)

        if current_quiz is None or current_quiz["id"] != quiz_id:
            raise ValueError("quizId does not match current question.")

        self.reveal_state_by_session_id.setdefault(session_id, set()).add(quiz_id)

        return deepcopy(current_quiz)

    def get_current_quiz(self, session: dict[str, Any]) -> dict[str, Any] | None:
        if session["status"] == "completed":
            return None

        current_index = session["currentIndex"]

        if current_index >= len(session["quizzes"]):
            return None

        return deepcopy(session["quizzes"][current_index])

    def has_answer_for_quiz(self, session: dict[str, Any], quiz_id: str) -> bool:
        return any(answer["quizId"] == quiz_id for answer in session["answers"])

    def add_quiz_answer(
        self,
        session_id: str,
        answer: dict[str, Any],
    ) -> dict[str, Any]:
        session = self.quiz_sessions[session_id]

        if self.has_answer_for_quiz(session, answer["quizId"]):
            raise ValueError("Current question has already been submitted.")

        session["answers"].append(answer)

        return deepcopy(answer)

    def was_quiz_revealed(self, session_id: str, quiz_id: str) -> bool:
        return quiz_id in self.reveal_state_by_session_id.get(session_id, set())

    def advance_quiz_session(self, session_id: str) -> dict[str, Any] | None:
        session = self.quiz_sessions.get(session_id)

        if session is None:
            return None

        if session["status"] == "completed":
            return deepcopy(session)

        next_index = session["currentIndex"] + 1

        if next_index >= len(session["quizzes"]):
            session["status"] = "completed"
            session["completedAt"] = utc_now_iso()
            session["currentIndex"] = len(session["quizzes"]) - 1
        else:
            session["currentIndex"] = next_index
            session["currentQuestionStartedAt"] = utc_now_iso()

        return deepcopy(session)

memory_store = MemoryStore()