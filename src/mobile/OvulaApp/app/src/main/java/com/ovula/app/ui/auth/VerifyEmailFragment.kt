package com.ovula.app.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.ovula.app.databinding.FragmentVerifyEmailBinding
import com.ovula.app.ui.main.MainActivity

class VerifyEmailFragment : Fragment() {

    private var _binding: FragmentVerifyEmailBinding? = null
    private val binding get() = _binding!!
    private var email: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        email = arguments?.getString("email")
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentVerifyEmailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.emailText.text = "Verification code sent to ${email ?: "your email"}"

        binding.verifyButton.setOnClickListener {
            val otp = binding.otpInput.text.toString()
            
            if (otp.isEmpty()) {
                Toast.makeText(context, "Please enter OTP", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // For now, just navigate to main activity
            // In production, verify OTP with backend
            Toast.makeText(context, "Email verified successfully!", Toast.LENGTH_SHORT).show()
            startActivity(Intent(requireContext(), MainActivity::class.java))
            requireActivity().finish()
        }

        binding.resendButton.setOnClickListener {
            Toast.makeText(context, "OTP resent to ${email ?: "your email"}", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
