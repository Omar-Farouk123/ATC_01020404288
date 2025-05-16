package com.booking.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    // Using a 256-bit key for HS256
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long TOKEN_VALIDITY = 1000 * 60 * 60 * 24; // 24 hours

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        return generateToken(claims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        System.out.println("JWT Service - Validating token for user: " + username);
        System.out.println("JWT Service - Expected user: " + userDetails.getUsername());
        System.out.println("JWT Service - User authorities: " + userDetails.getAuthorities());
        
        boolean isValid = (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
        System.out.println("JWT Service - Token is " + (isValid ? "valid" : "invalid"));
        return isValid;
    }

    private boolean isTokenExpired(String token) {
        boolean expired = extractExpiration(token).before(new Date());
        System.out.println("JWT Service - Token expiration check: " + (expired ? "expired" : "not expired"));
        return expired;
    }

    private Date extractExpiration(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        System.out.println("JWT Service - Token expiration: " + expiration);
        return expiration;
    }

    private Claims extractAllClaims(String token) {
        try {
            Claims claims = Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
            System.out.println("JWT Service - Token claims: " + claims);
            return claims;
        } catch (Exception e) {
            System.out.println("JWT Service - Error parsing token: " + e.getMessage());
            throw e;
        }
    }

    private Key getSignInKey() {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
} 