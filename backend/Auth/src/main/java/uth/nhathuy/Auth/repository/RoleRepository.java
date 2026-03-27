package uth.nhathuy.Auth.repository;

import uth.nhathuy.Auth.entity.Role;
import uth.nhathuy.Auth.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}