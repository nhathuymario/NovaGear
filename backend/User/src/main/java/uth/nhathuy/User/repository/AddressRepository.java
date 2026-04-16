package uth.nhathuy.User.repository;

import uth.nhathuy.User.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByAuthUserIdOrderByIsDefaultDescIdDesc(Long authUserId);
    List<Address> findAllByOrderByAuthUserIdAscIsDefaultDescIdDesc();
    Optional<Address> findByIdAndAuthUserId(Long id, Long authUserId);
    Optional<Address> findByAuthUserIdAndIsDefaultTrue(Long authUserId);
}