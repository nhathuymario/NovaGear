output "instance_public_ip" {
  description = "Public IP of the NovaGear EC2 instance."
  value       = aws_instance.app.public_ip
}

output "instance_public_dns" {
  description = "Public DNS of the NovaGear EC2 instance."
  value       = aws_instance.app.public_dns
}

output "ssh_command" {
  description = "Convenience SSH command."
  value       = "ssh ubuntu@${aws_instance.app.public_ip}"
}
