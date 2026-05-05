variable "aws_region" {
  description = "AWS region used for the EC2 deployment."
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name used for resource tags."
  type        = string
  default     = "novagear"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"
}

variable "availability_zone" {
  description = "AZ for the public subnet."
  type        = string
  default     = "ap-southeast-1a"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet."
  type        = string
  default     = "10.20.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.medium"
}

variable "ami_id" {
  description = "AMI for the EC2 host. Leave empty to use the latest Ubuntu 24.04 LTS image."
  type        = string
  default     = ""
}

variable "public_key" {
  description = "Public SSH key contents for the EC2 instance."
  type        = string
}

variable "ssh_ingress_cidr" {
  description = "CIDR allowed to SSH into the EC2 instance."
  type        = string
  default     = "0.0.0.0/0"
}

variable "app_ingress_cidrs" {
  description = "CIDRs allowed to access HTTP entrypoints."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "app_setup_script" {
  description = "Optional extra bootstrap commands appended to user_data."
  type        = string
  default     = ""
}
