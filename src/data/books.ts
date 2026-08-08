const BOOK_COLORS = [
  { color: "#1a1a1a", foil: "#ffffff" },
  { color: "#141414", foil: "#999999" },
  { color: "#1c1c1c", foil: "#cccccc" },
  { color: "#0f0f0f", foil: "#888888" },
  { color: "#161616", foil: "#aaaaaa" },
  { color: "#121212", foil: "#bbbbbb" },
  { color: "#181818", foil: "#dddddd" },
  { color: "#0d0d0d", foil: "#777777" },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  DevOps: ["docker", "kubernetes", "k8s", "ansible", "ci", "cd", "cicd", "devops", "git", "jenkins", "terraform", "iac", "openshift", "aws", "cloud", "container", "azure", "borg", "omega", "infrastructure", "api-driven"],
  Security: ["hacking", "security", "penetration", "ethical", "hack", "black hat", "exploitation", "voip", "ss7", "firewall", "attack"],
  Programming: ["python", "rust", "groovy", "programming", "develop", "coding"],
  Blockchain: ["bitcoin", "crypto", "blockchain", "ethereum"],
  Networking: ["bluetooth", "networking", "ss7", "cellular", "voip", "signalling"],
};

function toTitle(filename: string): string {
  return filename
    .replace(/[_-]/g, " ")
    .replace(/\.(pdf|epub|html|mobi|azw3|djvu)$/i, "")
    .replace(/\.\d{4}$/, "")
    .replace(/\s+by\s+.*$/i, "")
    .replace(/\s*-\s*.*Edition.*$/i, "")
    .replace(/\s*-\s*.*Anna.*$/i, "")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractCategory(filename: string): string {
  const lower = filename.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Other";
}

function extractTags(filename: string): string[] {
  const lower = filename.toLowerCase();
  const tags: string[] = [];
  for (const [, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw) && kw.length > 2 && !tags.includes(kw)) {
        tags.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }
  }
  return tags.slice(0, 5);
}

import { Book } from "@/types/book";
import path from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { assetUrl } from "@/lib/utils";

const BOOK_EXTENSIONS = /\.(pdf|epub|html|htm|mobi|azw3|djvu)$/i;

function coverFor(id: string): string | null {
  const file = path.join(process.cwd(), "public", "covers", `${id}.png`);
  return existsSync(file) ? assetUrl(`/covers/${id}.png`) : null;
}

function extractFormat(filename: string): Book["format"] {
  const ext = filename.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (ext === "pdf") return "pdf";
  if (ext === "epub") return "epub";
  if (ext === "html" || ext === "htm") return "html";
  return "other";
}

function slugify(filename: string, used: Set<string>): string {
  const base = filename
    .toLowerCase()
    .replace(BOOK_EXTENSIONS, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9\u0600-\u06ff\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const slug = base || "book";
  let candidate = slug;
  let i = 2;
  while (used.has(candidate)) candidate = `${slug}-${i++}`;
  return candidate;
}

function discoverBooks(existing: Book[]): Book[] {
  const booksDir = path.join(process.cwd(), "books");
  const manualFilenames = new Set(existing.map((b) => b.filename));
  const usedIds = new Set(existing.map((b) => b.id));

  try {
    const files = readdirSync(booksDir)
      .filter((f) => BOOK_EXTENSIONS.test(f) && !manualFilenames.has(f))
      .sort((a, b) => a.localeCompare(b));

    for (const filename of files) {
      existing.push({
        id: slugify(filename, usedIds),
        title: toTitle(filename),
        author: null,
        category: extractCategory(filename) || "Other",
        format: extractFormat(filename),
        filename,
        path: assetUrl(`/books/${filename}`),
        description: null,
        tags: extractTags(filename),
        pages: null,
        color: BOOK_COLORS[existing.length % BOOK_COLORS.length].color,
        foil: BOOK_COLORS[existing.length % BOOK_COLORS.length].foil,
      });
      usedIds.add(existing[existing.length - 1].id);
    }
  } catch {
    // books/ unavailable (e.g. build in Docker) — manual catalog only
  }

  return existing;
}

export async function getBooks(): Promise<Book[]> {
  const books: Book[] = [
    {
      id: "docker-ebook",
      title: "Docker eBook",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Docker_eBook.pdf",
      path: "/books/Docker_eBook.pdf",
      description: "Comprehensive guide to Docker containerization fundamentals and best practices.",
      tags: ["Docker", "Container"],
      pages: null,
      color: BOOK_COLORS[0].color,
      foil: BOOK_COLORS[0].foil,
    },
    {
      id: "kubernetes-for-everyone",
      title: "Kubernetes For Everyone",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Kubernetes For Everyone.pdf",
      path: "/books/Kubernetes For Everyone.pdf",
      description: "A beginner-friendly approach to understanding Kubernetes orchestration.",
      tags: ["Kubernetes", "K8s"],
      pages: null,
      color: BOOK_COLORS[1].color,
      foil: BOOK_COLORS[1].foil,
    },
    {
      id: "docker-by-federico",
      title: "Docker by Federico",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Docker by federico.pdf",
      path: "/books/Docker by federico.pdf",
      description: "In-depth exploration of Docker containers and practical deployment patterns.",
      tags: ["Docker", "Container"],
      pages: null,
      color: BOOK_COLORS[2].color,
      foil: BOOK_COLORS[2].foil,
    },
    {
      id: "learning-docker",
      title: "Learning Docker",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Learning Docker.pdf",
      path: "/books/Learning Docker.pdf",
      description: "Step-by-step guide to mastering Docker from fundamentals to production.",
      tags: ["Docker", "Container"],
      pages: null,
      color: BOOK_COLORS[3].color,
      foil: BOOK_COLORS[3].foil,
    },
    {
      id: "docker-qna-vijay",
      title: "Docker Q&A Vijay",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Docker QnA vijay.pdf",
      path: "/books/Docker QnA vijay.pdf",
      description: "Common Docker questions and answers for interview preparation.",
      tags: ["Docker"],
      pages: null,
      color: BOOK_COLORS[4].color,
      foil: BOOK_COLORS[4].foil,
    },
    {
      id: "container-networking",
      title: "Container Networking Docker Kubernetes",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Container-Networking-Docker-Kubernetes.pdf",
      path: "/books/Container-Networking-Docker-Kubernetes.pdf",
      description: "Networking fundamentals for containerized environments with Docker and Kubernetes.",
      tags: ["Docker", "Kubernetes", "Container"],
      pages: null,
      color: BOOK_COLORS[5].color,
      foil: BOOK_COLORS[5].foil,
    },
    {
      id: "ansible-configuration",
      title: "Ansible Configuration Management",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Ansible Configuration Management, 2nd Edition.pdf",
      path: "/books/Ansible Configuration Management, 2nd Edition.pdf",
      description: "Second edition covering Ansible for automated configuration management.",
      tags: ["Ansible", "DevOps"],
      pages: null,
      color: BOOK_COLORS[6].color,
      foil: BOOK_COLORS[6].foil,
    },
    {
      id: "ansible-quick-start",
      title: "AnsibleWorks Quick Start",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "AnsibleWorksQuickStart.pdf",
      path: "/books/AnsibleWorksQuickStart.pdf",
      description: "Quick start guide for getting productive with Ansible automation.",
      tags: ["Ansible", "DevOps"],
      pages: null,
      color: BOOK_COLORS[7].color,
      foil: BOOK_COLORS[7].foil,
    },
    {
      id: "devops-tools",
      title: "DevOps Tools Guide",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Devops Tools Guide.pdf",
      path: "/books/Devops Tools Guide.pdf",
      description: "Essential tools and workflows for modern DevOps practices.",
      tags: ["DevOps"],
      pages: null,
      color: BOOK_COLORS[0].color,
      foil: BOOK_COLORS[0].foil,
    },
    {
      id: "important-devops-interview",
      title: "Important DevOps Interview Questions",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Important DevOps Interview Questions.pdf",
      path: "/books/Important DevOps Interview Questions.pdf",
      description: "Collection of essential interview questions for DevOps roles.",
      tags: ["DevOps"],
      pages: null,
      color: BOOK_COLORS[1].color,
      foil: BOOK_COLORS[1].foil,
    },
    {
      id: "git-notes-professionals",
      title: "Git Notes for Professionals",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "GIT notes for professionals.pdf",
      path: "/books/GIT notes for professionals.pdf",
      description: "Professional-level reference for Git version control.",
      tags: ["Git", "DevOps"],
      pages: null,
      color: BOOK_COLORS[2].color,
      foil: BOOK_COLORS[2].foil,
    },
    {
      id: "git-interview",
      title: "Git Interview Questions",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Git Interview Questions.pdf",
      path: "/books/Git Interview Questions.pdf",
      description: "Common Git interview questions and their answers.",
      tags: ["Git", "DevOps"],
      pages: null,
      color: BOOK_COLORS[3].color,
      foil: BOOK_COLORS[3].foil,
    },
    {
      id: "cicd-project-aws",
      title: "CI/CD Project on AWS",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "CICD PROJECT ON AWS .pdf",
      path: "/books/CICD PROJECT ON AWS .pdf",
      description: "Practical guide to setting up CI/CD pipelines on AWS infrastructure.",
      tags: ["CI", "CD", "CICD", "AWS", "Cloud", "DevOps"],
      pages: null,
      color: BOOK_COLORS[4].color,
      foil: BOOK_COLORS[4].foil,
    },
    {
      id: "iac-terraform",
      title: "IaC Terraform",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "IaC_Terraform.pdf",
      path: "/books/IaC_Terraform.pdf",
      description: "Infrastructure as Code with Terraform for cloud resource management.",
      tags: ["IaC", "Terraform", "DevOps"],
      pages: null,
      color: BOOK_COLORS[5].color,
      foil: BOOK_COLORS[5].foil,
    },
    {
      id: "iac-thales",
      title: "IaC Thales",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "IaC Thales.pdf",
      path: "/books/IaC Thales.pdf",
      description: "Infrastructure as Code practices and patterns with Thales.",
      tags: ["IaC", "DevOps"],
      pages: null,
      color: BOOK_COLORS[6].color,
      foil: BOOK_COLORS[6].foil,
    },
    {
      id: "implementing-openshift",
      title: "Implementing OpenShift",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Implementing_OpenShift.pdf",
      path: "/books/Implementing_OpenShift.pdf",
      description: "Guide to implementing and managing Red Hat OpenShift clusters.",
      tags: ["OpenShift", "Kubernetes", "Container", "DevOps"],
      pages: null,
      color: BOOK_COLORS[7].color,
      foil: BOOK_COLORS[7].foil,
    },
    {
      id: "ckad-preparation",
      title: "CKAD Preparation",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "CKAD preparation.pdf",
      path: "/books/CKAD preparation.pdf",
      description: "Preparation material for the Certified Kubernetes Application Developer exam.",
      tags: ["Kubernetes", "DevOps"],
      pages: null,
      color: BOOK_COLORS[0].color,
      foil: BOOK_COLORS[0].foil,
    },
    {
      id: "kubernetes-cheat-sheet",
      title: "Kubernetes Cheat Sheet",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Kubernetes Cheat Sheet.pdf",
      path: "/books/Kubernetes Cheat Sheet.pdf",
      description: "Quick reference sheet for common Kubernetes commands and resources.",
      tags: ["Kubernetes", "K8s", "DevOps"],
      pages: null,
      color: BOOK_COLORS[1].color,
      foil: BOOK_COLORS[1].foil,
    },
    {
      id: "borg-omega-kubernetes",
      title: "Borg, Omega, Kubernetes",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "borg, omega, kubernetes.pdf",
      path: "/books/borg, omega, kubernetes.pdf",
      description: "Google paper on the evolution of cluster management from Borg to Omega to Kubernetes.",
      tags: ["Kubernetes", "Container"],
      pages: null,
      color: BOOK_COLORS[2].color,
      foil: BOOK_COLORS[2].foil,
    },
    {
      id: "dive-future-infrastructure",
      title: "Dive into the Future of Infrastructure",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Dive into the Future of Infrastructure - K8s.pdf",
      path: "/books/Dive into the Future of Infrastructure - K8s.pdf",
      description: "Exploring modern infrastructure paradigms with Kubernetes at the center.",
      tags: ["Kubernetes", "K8s", "DevOps", "Infrastructure"],
      pages: null,
      color: BOOK_COLORS[3].color,
      foil: BOOK_COLORS[3].foil,
    },
    {
      id: "aws-cli-ebook",
      title: "AWS CLI eBook",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "aws-cli ebook.pdf",
      path: "/books/aws-cli ebook.pdf",
      description: "Comprehensive guide to using the AWS Command Line Interface.",
      tags: ["AWS", "Cloud", "DevOps"],
      pages: null,
      color: BOOK_COLORS[4].color,
      foil: BOOK_COLORS[4].foil,
    },
    {
      id: "azure-devops",
      title: "Azure DevOps",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Azure DevOps.pdf",
      path: "/books/Azure DevOps.pdf",
      description: "Guide to Microsoft Azure DevOps services and practices.",
      tags: ["Azure", "DevOps", "Cloud", "CI", "CD"],
      pages: null,
      color: BOOK_COLORS[5].color,
      foil: BOOK_COLORS[5].foil,
    },
    {
      id: "building-enterprise-cloud",
      title: "Building an Enterprise Cloud",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "Building and Enterprise Cloud with Dummies.pdf",
      path: "/books/Building and Enterprise Cloud with Dummies.pdf",
      description: "For Dummies guide to building enterprise cloud infrastructure.",
      tags: ["Cloud", "DevOps"],
      pages: null,
      color: BOOK_COLORS[6].color,
      foil: BOOK_COLORS[6].foil,
    },
    {
      id: "api-driven-devops",
      title: "API-Driven DevOps",
      author: null,
      category: "DevOps",
      format: "pdf",
      filename: "api-driven-devops.pdf",
      path: "/books/api-driven-devops.pdf",
      description: "Rediscovering Borg, Omega, and Kubernetes for API-driven DevOps practices.",
      tags: ["DevOps", "Kubernetes"],
      pages: null,
      color: BOOK_COLORS[7].color,
      foil: BOOK_COLORS[7].foil,
    },
    {
      id: "black-hat-python",
      title: "Black Hat Python",
      author: "Justin Seitz",
      category: "Security",
      format: "pdf",
      filename: "Black Hat Python - Python Programming for Hackers and Pentesters - Justin Seitz.pdf",
      path: "/books/Black Hat Python - Python Programming for Hackers and Pentesters - Justin Seitz.pdf",
      description: "Python programming for hackers and penetration testers.",
      tags: ["Python", "Security", "Hacking", "Penetration"],
      pages: null,
      color: BOOK_COLORS[0].color,
      foil: BOOK_COLORS[0].foil,
    },
    {
      id: "hacking-art-exploitation",
      title: "Hacking: The Art of Exploitation",
      author: "Jon Erickson",
      category: "Security",
      format: "pdf",
      filename: "Hacking The Art of Exploitation, 2nd Edition - Jon Erickson.pdf",
      path: "/books/Hacking The Art of Exploitation, 2nd Edition - Jon Erickson.pdf",
      description: "The classic guide to understanding hacking techniques and exploitation.",
      tags: ["Security", "Hacking", "Exploitation", "Programming"],
      pages: null,
      color: BOOK_COLORS[1].color,
      foil: BOOK_COLORS[1].foil,
    },
    {
      id: "ethical-hacking-kali",
      title: "Ethical Hacking with Kali Linux",
      author: "Hugo Hoffman",
      category: "Security",
      format: "pdf",
      filename: "Ethical Hacking With Kali Linux - Learn Fast How To Hack Like A Pro by HUGO HOFFMAN.pdf",
      path: "/books/Ethical Hacking With Kali Linux - Learn Fast How To Hack Like A Pro by HUGO HOFFMAN.pdf",
      description: "Fast-paced guide to learning ethical hacking with Kali Linux.",
      tags: ["Security", "Hacking", "Ethical"],
      pages: null,
      color: BOOK_COLORS[2].color,
      foil: BOOK_COLORS[2].foil,
    },
    {
      id: "hacking-beginner-expert",
      title: "Hacking: Beginner to Expert Guide",
      author: "James Patterson",
      category: "Security",
      format: "pdf",
      filename: "Hacking - Beginner to Expert Guide to Computer Hacking, Basic Security, and Penetration Testing (Computer Science Series) - James Patterson.pdf",
      path: "/books/Hacking - Beginner to Expert Guide to Computer Hacking, Basic Security, and Penetration Testing (Computer Science Series) - James Patterson.pdf",
      description: "Complete guide from beginner to expert in computer hacking and penetration testing.",
      tags: ["Security", "Hacking", "Penetration"],
      pages: null,
      color: BOOK_COLORS[3].color,
      foil: BOOK_COLORS[3].foil,
    },
    {
      id: "hacking-networking-security",
      title: "Hacking: Networking and Security",
      author: "John Medicine",
      category: "Security",
      format: "pdf",
      filename: "Hacking - Networking and Security (2 Books in 1 - Hacking with Kali Linux Networking for Beginners) - John Medicine.pdf",
      path: "/books/Hacking - Networking and Security (2 Books in 1 - Hacking with Kali Linux Networking for Beginners) - John Medicine.pdf",
      description: "Two books in one covering hacking with Kali Linux and networking for beginners.",
      tags: ["Security", "Hacking", "Networking"],
      pages: null,
      color: BOOK_COLORS[4].color,
      foil: BOOK_COLORS[4].foil,
    },
    {
      id: "hacking-mobile-ss7",
      title: "Hacking Mobile Network via SS7",
      author: "Dmitry Kurbatov",
      category: "Security",
      format: "pdf",
      filename: "Hacking mobile network via SS7 - interception, shadowing and more - Dmitry Kurbatov.pdf",
      path: "/books/Hacking mobile network via SS7 - interception, shadowing and more - Dmitry Kurbatov.pdf",
      description: "Deep dive into SS7 protocol vulnerabilities and mobile network exploitation.",
      tags: ["Security", "Hacking", "SS7", "Networking", "Cellular"],
      pages: null,
      color: BOOK_COLORS[5].color,
      foil: BOOK_COLORS[5].foil,
    },
    {
      id: "hacking-voip-exposed",
      title: "Hacking VoIP Exposed",
      author: "David Endler, Mark Collier",
      category: "Security",
      format: "pdf",
      filename: "Hacking VoIP Exposed by David Endler, TippingPoint, Mark Collier and SecureLogix.pdf",
      path: "/books/Hacking VoIP Exposed by David Endler, TippingPoint, Mark Collier and SecureLogix.pdf",
      description: "Exposing vulnerabilities and attack vectors in Voice over IP systems.",
      tags: ["Security", "Hacking", "VoIP", "Networking"],
      pages: null,
      color: BOOK_COLORS[6].color,
      foil: BOOK_COLORS[6].foil,
    },
    {
      id: "google-hacks",
      title: "Google Hacks",
      author: "Tara Calishain, Rael Dornfest",
      category: "Security",
      format: "pdf",
      filename: "Google Hacks - 100 Industrial-Strength Tips _ Tools 1st Edition - Tara Calishain and Rael Dornfest.pdf",
      path: "/books/Google Hacks - 100 Industrial-Strength Tips _ Tools 1st Edition - Tara Calishain and Rael Dornfest.pdf",
      description: "100 industrial-strength tips and tools for advanced Google usage.",
      tags: ["Security"],
      pages: null,
      color: BOOK_COLORS[7].color,
      foil: BOOK_COLORS[7].foil,
    },
    {
      id: "cellular-location-tracking",
      title: "Cellular Location Tracking Attacks",
      author: null,
      category: "Security",
      format: "pdf",
      filename: "Cellular location tracking attacks using signalling protocols - Aalto University.pdf",
      path: "/books/Cellular location tracking attacks using signalling protocols - Aalto University.pdf",
      description: "Academic research on cellular location tracking attacks via signalling protocols.",
      tags: ["Security", "Cellular", "Networking"],
      pages: null,
      color: BOOK_COLORS[0].color,
      foil: BOOK_COLORS[0].foil,
    },
    {
      id: "beginners-guide-bitcoin",
      title: "A Beginner's Guide to Bitcoin",
      author: "Matthew R. Kratter",
      category: "Blockchain",
      format: "epub",
      filename: "A Beginner's Guide To Bitcoin - Matthew R. Kratter.epub",
      path: "/books/A Beginner's Guide To Bitcoin - Matthew R. Kratter.epub",
      description: "Comprehensive beginner's introduction to Bitcoin and cryptocurrency.",
      tags: ["Bitcoin", "Crypto", "Blockchain"],
      pages: null,
      color: BOOK_COLORS[1].color,
      foil: BOOK_COLORS[1].foil,
    },
    {
      id: "bitcoin",
      title: "Bitcoin",
      author: null,
      category: "Blockchain",
      format: "pdf",
      filename: "bitcoin.pdf",
      path: "/books/bitcoin.pdf",
      description: "Overview and deep dive into the Bitcoin protocol and ecosystem.",
      tags: ["Bitcoin", "Crypto", "Blockchain"],
      pages: null,
      color: BOOK_COLORS[2].color,
      foil: BOOK_COLORS[2].foil,
    },
    {
      id: "intro-to-crypto",
      title: "Introduction to Cryptography",
      author: null,
      category: "Blockchain",
      format: "pdf",
      filename: "intro-to-crypto.pdf",
      path: "/books/intro-to-crypto.pdf",
      description: "Foundational introduction to cryptographic principles and algorithms.",
      tags: ["Crypto", "Blockchain"],
      pages: null,
      color: BOOK_COLORS[3].color,
      foil: BOOK_COLORS[3].foil,
    },
    {
      id: "building-bitcoin-rust",
      title: "Building Bitcoin in Rust",
      author: null,
      category: "Blockchain",
      format: "pdf",
      filename: "Building bitcoin in Rust.pdf",
      path: "/books/Building bitcoin in Rust.pdf",
      description: "Hands-on guide to implementing Bitcoin protocols in the Rust programming language.",
      tags: ["Bitcoin", "Crypto", "Rust", "Blockchain", "Programming"],
      pages: null,
      color: BOOK_COLORS[4].color,
      foil: BOOK_COLORS[4].foil,
    },
    {
      id: "learning-groovy",
      title: "Learning Groovy",
      author: null,
      category: "Programming",
      format: "pdf",
      filename: "Learning Groovy.pdf",
      path: "/books/Learning Groovy.pdf",
      description: "Introduction to the Groovy programming language for the JVM.",
      tags: ["Programming", "Groovy"],
      pages: null,
      color: BOOK_COLORS[5].color,
      foil: BOOK_COLORS[5].foil,
    },
    {
      id: "bluetooth-technology",
      title: "Bluetooth Technology and Applications",
      author: null,
      category: "Networking",
      format: "pdf",
      filename: "8.Session3-3 Bluetooth Technology and Applications-杨波V3.pdf",
      path: "/books/8.Session3-3 Bluetooth Technology and Applications-杨波V3.pdf",
      description: "Session on Bluetooth technology fundamentals and real-world applications.",
      tags: ["Bluetooth", "Networking"],
      pages: null,
      color: BOOK_COLORS[6].color,
      foil: BOOK_COLORS[6].foil,
    },
  ];
  return discoverBooks(books)
    .map((book) => ({ ...book, cover: coverFor(book.id) }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
